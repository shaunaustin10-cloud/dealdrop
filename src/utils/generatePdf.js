import jsPDF from 'jspdf';

export const generateDealReport = (deal) => {
  if (!deal) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 15;
  const contentWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  let y = margin;

  // --- Helper to add new page if content overflows ---
  const addPageIfNeeded = (height) => {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // --- Header ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 245, 245); // Adjust for dark background
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), y + 15, 'F');
  doc.text('REI Deal Drop - Analysis Report', margin, y + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200); // Lighter text for header
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, y + 20);
  y += 30; // Move y past header area

  // --- Property Address ---
  addPageIfNeeded(20);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0); // Black for main content
  doc.text(deal.address || 'Unknown Address', margin, y);
  y += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Property Type: ${deal.propertyType || 'N/A'}`, margin, y);
  y += 10;

  // --- Function to draw a simple table ---
  const drawSimpleTable = (headers, body, startY, colWidths) => {
    let currentY = startY;
    const cellPadding = 2;
    const headerFillColor = [60, 60, 60];
    const headerTextColor = [255, 255, 255];
    const rowTextColor = [30, 30, 30];
    const altRowFillColor = [245, 245, 245];
    const lineColor = [200, 200, 200];
    const rowHeight = 7;

    // Draw Headers
    doc.setFillColor(headerFillColor[0], headerFillColor[1], headerFillColor[2]);
    doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let currentX = margin;
    headers.forEach((header, i) => {
      doc.rect(currentX, currentY, colWidths[i], rowHeight, 'F');
      doc.text(header, currentX + cellPadding, currentY + rowHeight / 2 + 1, { baseline: 'middle' });
      currentX += colWidths[i];
    });
    currentY += rowHeight;

    // Draw Body
    doc.setFont('helvetica', 'normal');
    body.forEach((row, rowIndex) => {
      addPageIfNeeded(rowHeight); // Check if new page is needed for row
      doc.setTextColor(rowTextColor[0], rowTextColor[1], rowTextColor[2]);
      
      currentX = margin;
      row.forEach((cell, i) => {
        if (rowIndex % 2 !== 0) { // Alternate row colors
          doc.setFillColor(altRowFillColor[0], altRowFillColor[1], altRowFillColor[2]); // light gray
        } else {
          doc.setFillColor(255, 255, 255); // White
        }
        doc.rect(currentX, currentY, colWidths[i], rowHeight, 'F'); // Draw filled rectangle
        doc.text(String(cell), currentX + cellPadding, currentY + rowHeight / 2 + 1, { baseline: 'middle' });
        currentX += colWidths[i];
      });
      currentY += rowHeight;
    });

    // Draw borders
    doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    doc.setLineWidth(0.1);
    doc.rect(margin, startY, contentWidth, currentY - startY); // Outline of the whole table
    currentX = margin;
    for(let i=0; i<headers.length; i++) {
        currentX += colWidths[i];
        if (i < headers.length - 1) { // Don't draw vertical line after last column
            doc.line(currentX, startY, currentX, currentY);
        }
    }
    // Draw horizontal lines
    for (let i = startY; i <= currentY; i += rowHeight) {
        doc.line(margin, i, margin + contentWidth, i);
    }
    
    return currentY;
  };


  // --- Key Deal Metrics ---
  addPageIfNeeded(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Deal Metrics', margin, y);
  y += 5;

  const keyMetricsBody = [
    ['Asking Price', `$${Number(deal.price).toLocaleString()}`],
    ['Est. ARV (After Repair Value)', `$${Number(deal.arv).toLocaleString()}`],
    ['ARV Range', `$${Number(deal.aiAnalysis?.market?.arvRange?.low).toLocaleString()} - $${Number(deal.aiAnalysis?.market?.arvRange?.high).toLocaleString()}`],
    ['Est. Rehab Cost', `$${Number(deal.rehab).toLocaleString()}`],
    ['Est. Rent', `$${Number(deal.rent).toLocaleString()}`],
    ['Rent Range', `$${Number(deal.aiAnalysis?.market?.rentRange?.low).toLocaleString()} - $${Number(deal.aiAnalysis?.market?.rentRange?.high).toLocaleString()}`],
    ['SqFt', `${deal.sqft || 'N/A'}`],
    ['Bed/Bath', `${deal.bedrooms || 'N/A'}/${deal.bathrooms || 'N/A'}`],
    ['Year Built', `${deal.yearBuilt || 'N/A'}`],
  ];
  y = drawSimpleTable(['Metric', 'Value'], keyMetricsBody, y, [contentWidth / 2, contentWidth / 2]) + 10;


  // --- AI Analysis ---
  if (deal.aiAnalysis?.gemini) {
    addPageIfNeeded(70);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Deal Analysis (Gemini)', margin, y);
    y += 5;

    const gemini = deal.aiAnalysis.gemini;
    const aiDataBody = [
      ['Verdict', gemini.verdict || 'N/A'],
      ['Deal Score', `${gemini.score || 0}/100`],
      ['Confidence Score (Rentcast)', `${deal.aiAnalysis.market?.confidenceScore || 'N/A'}%`],
      ['Calculated MAO (Max Allowable Offer)', `$${Number(gemini.calculated_mao).toLocaleString()}`],
      ['Projected Profit', `$${Number(gemini.projected_profit).toLocaleString()}`],
    ];
    
    y = drawSimpleTable(['Metric', 'Value'], aiDataBody, y, [contentWidth / 2, contentWidth / 2]) + 7;

    // AI Summary
    addPageIfNeeded(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Underwriter\'s Summary:', margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(gemini.summary || 'No summary provided.', contentWidth);
    doc.text(splitSummary, margin, y);
    y += (splitSummary.length * 4) + 7;

    // Risks and Strengths
    addPageIfNeeded(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Risks:', margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (gemini.risks && gemini.risks.length > 0) {
      gemini.risks.forEach((risk, index) => {
        const splitRisk = doc.splitTextToSize(`• ${risk}`, contentWidth);
        doc.text(splitRisk, margin, y);
        y += (splitRisk.length * 4);
      });
    } else {
      doc.text('No specific risks identified.', margin, y);
      y += 4;
    }
    y += 5;

    addPageIfNeeded(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths:', margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (gemini.strengths && gemini.strengths.length > 0) {
      gemini.strengths.forEach((strength, index) => {
        const splitStrength = doc.splitTextToSize(`• ${strength}`, contentWidth);
        doc.text(splitStrength, margin, y);
        y += (splitStrength.length * 4);
      });
    } else {
      doc.text('No specific strengths identified.', margin, y);
      y += 4;
    }
    y += 5;
  }

  // --- Market Comps ---
  if (deal.aiAnalysis?.market?.comps?.length > 0 || deal.aiAnalysis?.market?.rentComps?.length > 0) {
    addPageIfNeeded(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Market Comparables (Rentcast)', margin, y);
    y += 5;

    const salesComps = deal.aiAnalysis.market.comps || [];
    const rentComps = deal.aiAnalysis.market.rentComps || [];

    if (salesComps.length > 0) {
      addPageIfNeeded(40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Comps:', margin, y);
      y += 5;

      const salesCompHeaders = ['Address', 'Price', 'Distance', 'Date'];
      const salesCompBody = salesComps.map(comp => [
        comp.address,
        `$${Number(comp.price).toLocaleString()}`,
        comp.distance,
        comp.date
      ]);
      y = drawSimpleTable(salesCompHeaders, salesCompBody, y, [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2]) + 7;
    }

    if (rentComps.length > 0) {
      addPageIfNeeded(40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Rental Comps:', margin, y);
      y += 5;

      const rentCompHeaders = ['Address', 'Rent', 'Distance', 'Date'];
      const rentCompBody = rentComps.map(comp => [
        comp.address,
        `$${Number(comp.rent).toLocaleString()}`,
        comp.distance,
        comp.date
      ]);
      y = drawSimpleTable(rentCompHeaders, rentCompBody, y, [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2]) + 7;
    }
  }

  // --- CRM Details ---
  addPageIfNeeded(50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Internal CRM Details', margin, y);
  y += 5;

  const crmDetailsBody = [
    ['Status', deal.status || 'N/A'],
    ['Lead Source', deal.leadSource || 'N/A'],
    ['Seller Name', deal.sellerName || 'N/A'],
    ['Seller Phone', deal.sellerPhone || 'N/A'],
    ['Seller Email', deal.sellerEmail || 'N/A'],
    ['Notes', deal.notes ? doc.splitTextToSize(deal.notes, contentWidth / 2).join('\n') : 'N/A'], // Handle multi-line notes
  ];
  y = drawSimpleTable(['Detail', 'Value'], crmDetailsBody, y, [contentWidth / 2, contentWidth / 2]) + 10;

  // --- Footer ---
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount - 1; i++) { // pageCount -1 because doc.internal.pages includes null at index 0
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount - 1}`, doc.internal.pageSize.getWidth() - margin, doc.internal.pageSize.getHeight() - margin, null, null, 'right');
  }

  doc.save(`deal-report-${(deal.address || 'unknown').substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

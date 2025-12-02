import jsPDF from 'jspdf';

export const generateDealReport = (deal) => {
  if (!deal) return;

  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text('REI Deal Drop - Deal Analysis', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
  y += 15;

  // Property Address
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text(deal.address || 'Unknown Address', margin, y);
  y += 10;

  // Deal Score
  doc.setFontSize(12);
  doc.text(`Deal Score: ${deal.dealScore || 0}/100`, margin, y);
  y += 15;

  // Key Stats Grid
  const statsY = y;
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, 170, 25, 'F');
  
  doc.setFontSize(12);
  doc.text(`Price: $${Number(deal.price).toLocaleString()}`, margin + 5, y + 10);
  doc.text(`ARV: $${Number(deal.arv).toLocaleString()}`, margin + 60, y + 10);
  doc.text(`Rehab: $${Number(deal.rehab).toLocaleString()}`, margin + 120, y + 10);
  
  doc.text(`Rent: $${Number(deal.rent).toLocaleString()}`, margin + 5, y + 20);
  doc.text(`ROI: ${((Number(deal.arv) - (Number(deal.price) + Number(deal.rehab))) / (Number(deal.price) + Number(deal.rehab)) * 100).toFixed(1)}%`, margin + 60, y + 20);
  doc.text(`Sqft: ${deal.sqft}`, margin + 120, y + 20);

  y += 35;

  // Property Details
  doc.setFontSize(14);
  doc.text('Property Details', margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(`Bedrooms: ${deal.bedrooms || '-'}`, margin, y);
  doc.text(`Bathrooms: ${deal.bathrooms || '-'}`, margin + 50, y);
  doc.text(`Status: ${deal.status || 'New Lead'}`, margin + 100, y);
  y += 15;

  // Notes
  if (deal.notes) {
    doc.setFontSize(14);
    doc.text('Notes', margin, y);
    y += 8;
    doc.setFontSize(10);
    
    const splitNotes = doc.splitTextToSize(deal.notes, 170);
    doc.text(splitNotes, margin, y);
    y += (splitNotes.length * 5) + 10;
  }

  // Seller Info (Private)
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  y += 10;

  doc.setFontSize(14);
  doc.text('Internal CRM Data', margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(`Seller Name: ${deal.sellerName || '-'}`, margin, y);
  doc.text(`Seller Phone: ${deal.sellerPhone || '-'}`, margin + 60, y);
  doc.text(`Lead Source: ${deal.leadSource || '-'}`, margin + 120, y);
  y += 8;
  doc.text(`Seller Email: ${deal.sellerEmail || '-'}`, margin, y);

  // Save
  doc.save(`deal-report-${deal.address.substring(0, 10).replace(/\s/g, '_')}.pdf`);
};

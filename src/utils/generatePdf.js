import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Helper to load image from URL for PDF
const getImageData = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Image Load Timeout")), timeout);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      clearTimeout(timer);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Image Load Error"));
    };
  });
};

export const generateDealReport = async (deal, userProfile = null) => {
  if (!deal) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 15;
  const contentWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  let y = 15;

  // Colors
  const slate = [15, 23, 42];
  const emerald = [16, 185, 129];
  const lightGray = [248, 250, 252];

  // --- HEADER ---
  if (userProfile?.logoUrl) {
    try {
      const logoData = await getImageData(userProfile.logoUrl);
      doc.addImage(logoData, 'PNG', margin, y, 25, 15, undefined, 'FAST');
    } catch { 
        console.warn("Logo failed");
    }
  } else {
    doc.setFillColor(...emerald);
    doc.rect(margin, y, 8, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate);
    doc.text('REI Deal Drop', margin + 10, y + 6);
  }
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - margin, y + 6, { align: 'right' });
  y += 20;

  // --- TITLE ---
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slate);
  const splitAddress = doc.splitTextToSize(deal.address || 'Unknown Property', contentWidth);
  doc.text(splitAddress, margin, y);
  y += (splitAddress.length * 8) + 2;

  // --- HERO IMAGE ---
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(deal.address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const primaryImageUrl = (deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) ? deal.imageUrls[0] : streetViewUrl;

  try {
      const heroData = await getImageData(primaryImageUrl);
      doc.addImage(heroData, 'JPEG', margin, y, contentWidth, 80, undefined, 'FAST');
  } catch {
      // Fallback gray box
      doc.setFillColor(240);
      doc.rect(margin, y, contentWidth, 80, 'F');
      doc.text("Image Unavailable", margin + contentWidth/2, y + 40, { align: 'center' });
  }
  y += 85;

  // --- PROPERTY SPECS ---
  const specs = [
      { label: 'Bedrooms', val: deal.bedrooms || '-' },
      { label: 'Bathrooms', val: deal.bathrooms || '-' },
      { label: 'Sqft', val: deal.sqft ? `${deal.sqft} sqft` : '-' },
      { label: 'Year Built', val: deal.yearBuilt || '-' },
      { label: 'Prop Type', val: deal.propertyType || 'Single Family' }
  ];
  
  const specWidth = contentWidth / specs.length;
  specs.forEach((spec, i) => {
      doc.setFillColor(...lightGray);
      doc.rect(margin + (i * specWidth), y, specWidth - 2, 15, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(spec.label.toUpperCase(), margin + (i * specWidth) + (specWidth/2), y + 5, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(...slate);
      doc.setFont('helvetica', 'bold');
      doc.text(spec.val.toString(), margin + (i * specWidth) + (specWidth/2), y + 11, { align: 'center' });
  });
  y += 22;

  // --- FINANCIAL BREAKDOWN TABLE ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slate);
  doc.text("Financial Breakdown", margin, y);
  y += 2;

  const price = parseFloat(deal.price) || 0;
  const rehab = parseFloat(deal.rehab) || 0;
  const arv = parseFloat(deal.arv) || 0;
  const closingCosts = parseFloat(deal.miscClosingCosts) || 0;
  const assignment = parseFloat(deal.assignmentFee) || 0;
  
  const totalCost = price + rehab + closingCosts + assignment;
  const projectedProfit = arv - totalCost;
  const roi = totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0;

  const financeData = [
      ['Purchase Price', `$${price.toLocaleString()}`],
      ['Estimated Rehab', `$${rehab.toLocaleString()}`],
      ['Closing Costs & Fees', `$${(closingCosts + assignment).toLocaleString()}`],
      ['TOTAL PROJECT COST', `$${totalCost.toLocaleString()}`],
      ['After Repair Value (ARV)', `$${arv.toLocaleString()}`],
      ['PROJECTED NET PROFIT', `$${projectedProfit.toLocaleString()}`],
      ['ESTIMATED ROI', `${roi.toFixed(1)}%`]
  ];

  autoTable(doc, {
    startY: y + 4,
    head: [['Item', 'Amount']],
    body: financeData,
    theme: 'striped',
    headStyles: { fillColor: emerald, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right' }
    },
    didParseCell: function (data) {
        if (data.row.index === 3 || data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = slate;
            data.cell.styles.fillColor = [226, 232, 240];
        }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // --- MARKET ANALYSIS & COMPS ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Market Analysis & Comps", margin, y);
  
  if (deal.aiAnalysis?.gemini) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      doc.text(`AI Score: ${deal.aiAnalysis.gemini.score}/100  |  Verdict: ${deal.aiAnalysis.gemini.verdict}`, margin, y + 6);
  }

  y += 10;

  // Filter sold comps or use existing
  let comps = deal.comps || [];
  if (deal.aiAnalysis?.market?.comps) {
      comps = [...comps, ...deal.aiAnalysis.market.comps];
  }
  // Dedup and sort
  comps = comps.filter((v,i,a)=>a.findIndex(t=>(t.address === v.address))===i);

  const compData = comps.slice(0, 5).map(c => [
      c.address?.substring(0, 30),
      c.status || 'Sold',
      `$${Number(c.price).toLocaleString()}`,
      c.date || '-',
      c.distance || '-'
  ]);

  if (compData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Address', 'Status', 'Price', 'Date', 'Dist']],
        body: compData,
        theme: 'grid',
        headStyles: { fillColor: slate, textColor: 255 },
        styles: { fontSize: 8 },
      });
      y = doc.lastAutoTable.finalY + 15;
  } else {
      doc.setFontSize(10);
      doc.text("No comparable sales data available.", margin, y + 5);
      y += 15;
  }

  // --- PHOTO GALLERY (Page 2) ---
  if (deal.imageUrls && deal.imageUrls.length > 1) {
      doc.addPage();
      let gy = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("Property Photos", margin, gy);
      gy += 10;

      const galleryImages = deal.imageUrls.filter(u => !u.includes('picsum')).slice(0, 6);
      const imgW = (contentWidth - 10) / 2;
      const imgH = 60;

      for (let i = 0; i < galleryImages.length; i++) {
          try {
              const imgData = await getImageData(galleryImages[i]);
              const xPos = margin + (i % 2 === 0 ? 0 : imgW + 10);
              const yPos = gy + (Math.floor(i / 2) * (imgH + 10));
              doc.addImage(imgData, 'JPEG', xPos, yPos, imgW, imgH, undefined, 'FAST');
          } catch {
              // skip
          }
      }
  }

  // Save
  doc.save(`DealReport_${deal.address.substring(0, 10)}.pdf`);
};
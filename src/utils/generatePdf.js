import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Helper to load image from URL for PDF using Canvas (more robust for CORS)
const getImageData = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Enable CORS for images from Firebase/Google
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      } catch (err) {
        reject(new Error("Canvas tainted: " + err.message));
      }
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image at: " + url));
    };
    
    // Add a cache buster if it's a streetview URL to bypass potential restrictive headers
    const finalUrl = url.includes('maps.googleapis.com') ? `${url}&cb=${Date.now()}` : url;
    img.src = finalUrl;
  });
};

export const generateDealReport = async (deal, userProfile = null, overriddenHeroUrl = null) => {
  if (!deal) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 2 * margin;
  let y = 15;

  // Colors
  const slate = [15, 23, 42];
  const nextHomeOrange = [227, 82, 5];
  const lightGray = [248, 250, 252];
  const borderGray = [226, 232, 240];

  // --- HEADER ---
  if (userProfile?.logoUrl) {
    try {
      const logoData = await getImageData(userProfile.logoUrl);
      doc.addImage(logoData, 'PNG', margin, y, 25, 15, undefined, 'FAST');
    } catch { 
        console.warn("Logo failed");
    }
  } else {
    doc.setFillColor(...nextHomeOrange);
    doc.roundedRect(margin, y, 8, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('D', margin + 2, y + 6);
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(...slate);
    doc.text('NextHome Mission to Serve', margin + 11, y + 6);
  }
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 160, 160);
  doc.text('PROPERTY ANALYSIS REPORT', pageWidth - margin, y + 6, { align: 'right' });
  y += 18;

  // --- TITLE & ADDRESS ---
  const mainAddress = (deal.address || 'Unknown Property').split('\n')[0];
  const subAddress = (deal.address || '').split('\n').slice(1).join(' ') || (deal.city ? `${deal.city}, ${deal.state || ''}` : '');
  
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  doc.setTextColor(...slate);
  doc.text(mainAddress, margin, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(subAddress, margin, y);
  y += 8;

  // --- HERO IMAGE ---
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(deal.address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const primaryImageUrl = overriddenHeroUrl || ((deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) ? deal.imageUrls[0] : streetViewUrl);

  try {
      const heroData = await getImageData(primaryImageUrl);
      doc.addImage(heroData, 'JPEG', margin, y, contentWidth, 75, undefined, 'FAST');
  } catch (err) {
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, contentWidth, 75, 'F');
      doc.setTextColor(150);
      doc.text("Image Unavailable", margin + contentWidth/2, y + 37, { align: 'center' });
  }
  y += 80;

  // --- PROPERTY SPECS (Pill Style) ---
  const specs = [
      { label: 'BEDS', val: deal.bedrooms || '-' },
      { label: 'BATHS', val: deal.bathrooms || '-' },
      { label: 'SQFT', val: deal.sqft ? `${deal.sqft.toLocaleString()}` : '-' },
      { label: 'YEAR', val: deal.yearBuilt || '-' },
      { label: 'TYPE', val: (deal.propertyType || 'Single Family').split(' ')[0] }
  ];
  
  const specWidth = contentWidth / specs.length;
  specs.forEach((spec, i) => {
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'bold');
      doc.text(spec.label, margin + (i * specWidth) + (specWidth/2), y + 2, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(...slate);
      doc.text(spec.val.toString(), margin + (i * specWidth) + (specWidth/2), y + 8, { align: 'center' });
  });
  
  y += 15;
  doc.setDrawColor(...borderGray);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- FINANCIAL BREAKDOWN ---
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.setTextColor(...slate);
  doc.text("Executive Financial Summary", margin, y);
  y += 5;

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
      ['Closing & Fees', `$${(closingCosts + assignment).toLocaleString()}`],
      ['TOTAL INVESTMENT', `$${totalCost.toLocaleString()}`],
      ['After Repair Value', `$${arv.toLocaleString()}`],
      ['PROJECTED PROFIT', `$${projectedProfit.toLocaleString()}`],
      ['ESTIMATED ROI', `${roi.toFixed(1)}%`]
  ];

  autoTable(doc, {
    startY: y,
    body: financeData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4, textColor: [51, 65, 85] },
    columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 'auto' },
        1: { halign: 'right', fontStyle: 'bold', textColor: slate }
    },
    didParseCell: function (data) {
        if (data.row.index === 3 || data.row.index === 5 || data.row.index === 6) {
            data.cell.styles.fillColor = [241, 245, 249];
            if (data.row.index === 5) data.cell.styles.textColor = nextHomeOrange;
        }
    }
  });

  // Footer Page 1
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text(`Page 1 of 2`, pageWidth / 2, 285, { align: 'center' });

  // --- PAGE 2 ---
  doc.addPage();
  y = 20;

  // --- DEAL NOTES ---
  if (deal.notes) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.setTextColor(...slate);
      doc.text("Underwriter Notes", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      const splitNotes = doc.splitTextToSize(deal.notes, contentWidth);
      const notesHeight = Math.min(splitNotes.length * 5, 60); // Limit notes area height
      doc.text(splitNotes.slice(0, 12), margin, y);
      y += notesHeight + 10;
  }

  // --- MARKET COMPS ---
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.setTextColor(...slate);
  doc.text("Comparable Sales Analysis", margin, y);
  y += 6;

  let comps = [...(deal.comps || []), ...(deal.aiAnalysis?.market?.comps || [])]
      .filter((v,i,a)=>a.findIndex(t=>(t.address === v.address))===i);

  const compData = comps.slice(0, 6).map(c => [
      (c.address || '').split(',').slice(0, 2).join(','),
      c.status || 'Sold',
      `$${Number(c.price || c.soldPrice || 0).toLocaleString()}`,
      c.date ? new Date(c.date).toLocaleDateString() : 'N/A'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Address', 'Status', 'Price', 'Date']],
    body: compData,
    theme: 'striped',
    headStyles: { fillColor: slate, textColor: 255, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 },
  });
  
  y = doc.lastAutoTable.finalY + 15;

  // --- PHOTO GALLERY (Bottom of Page 2) ---
  const galleryImages = (deal.imageUrls || []).filter(u => !u.includes('picsum') && u !== primaryImageUrl).slice(0, 4);
  if (galleryImages.length > 0) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.setTextColor(...slate);
      doc.text("Property Gallery", margin, y);
      y += 6;

      const imgW = (contentWidth - 6) / 2;
      const imgH = 45;

      for (let i = 0; i < galleryImages.length; i++) {
          try {
              const imgData = await getImageData(galleryImages[i]);
              const xPos = margin + (i % 2 === 0 ? 0 : imgW + 6);
              const yPos = y + (Math.floor(i / 2) * (imgH + 6));
              doc.addImage(imgData, 'JPEG', xPos, yPos, imgW, imgH, undefined, 'FAST');
          } catch (e) {
              console.warn("Gallery img failed");
          }
      }
  }

  // Footer Page 2
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text(`Page 2 of 2`, pageWidth / 2, 285, { align: 'center' });

  // Save
  doc.save(`DealReport_${mainAddress.replace(/\s+/g, '_')}.pdf`);
};
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
  const contentWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  let y = 15;

  // Colors
  const slate = [15, 23, 42];
  const nextHomeOrange = [227, 82, 5]; // #E35205
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
    // Recreate NextHome Mission to Serve branding in PDF
    const iconSize = 8;
    const roundedness = 1;
    
    // Draw NextHome Orange Rounded Box
    doc.setFillColor(...nextHomeOrange);
    doc.roundedRect(margin, y, iconSize, iconSize, roundedness, roundedness, 'F');
    
    // Simple minimalist D for Deker
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('D', margin + 2, y + 6);

    // Brand Text
    doc.setFontSize(16);
    doc.setFont('times', 'bold'); // Serif feel for PDF
    doc.setTextColor(...slate);
    doc.text('NextHome Mission to Serve', margin + 11, y + 6);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 150, 150);
    doc.text('AT NEXTHOME', margin + 11, y + 9);
  }
  
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  // Date line removed per user request to clear up unwanted text
  // doc.text(`Report Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - margin, y + 6, { align: 'right' });
  y += 20;

  // --- TITLE ---
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.setTextColor(...slate);
  // Ensure we only take the primary address part if it's multi-line or contains extra data
  const mainAddress = (deal.address || 'Unknown Property').split('\n')[0].split(',')[0] + (deal.address?.includes(',') ? ',' : '') + (deal.address?.split(',')[1] || '');
  const splitAddress = doc.splitTextToSize(mainAddress, contentWidth);
  doc.text(splitAddress, margin, y);
  y += (splitAddress.length * 8) + 2;

  // --- HERO IMAGE ---
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(deal.address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const primaryImageUrl = overriddenHeroUrl || ((deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) ? deal.imageUrls[0] : streetViewUrl);

  try {
      const heroData = await getImageData(primaryImageUrl);
      doc.addImage(heroData, 'JPEG', margin, y, contentWidth, 80, undefined, 'FAST');
  } catch (err) {
      console.warn("Failed to load hero image for PDF:", err);
      try {
          // Attempt fallback to a generic house image
          const fallbackUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop";
          const fallbackData = await getImageData(fallbackUrl);
          doc.addImage(fallbackData, 'JPEG', margin, y, contentWidth, 80, undefined, 'FAST');
      } catch {
          // Final fallback if even the generic image fails
          doc.setFillColor(240);
          doc.rect(margin, y, contentWidth, 80, 'F');
          doc.text("Image Unavailable", margin + contentWidth/2, y + 40, { align: 'center' });
      }
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
  doc.setFont('times', 'bold');
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
    headStyles: { fillColor: nextHomeOrange, textColor: 255, fontStyle: 'bold' },
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

  // --- MARKET ANALYSIS & COMPS (Page 2) ---
  doc.addPage();
  y = 20; // Reset Y for new page
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slate);
  doc.text("Market Analysis & Comps", margin, y);
  
  y += 10;

  // Filter sold comps or use existing
  let comps = deal.comps || [];
  if (deal.aiAnalysis?.market?.comps) {
      comps = [...comps, ...deal.aiAnalysis.market.comps];
  }
  // Dedup and sort
  comps = comps.filter((v,i,a)=>a.findIndex(t=>(t.address === v.address))===i);

  const compData = comps.slice(0, 5).map(c => {
      // Robust date formatting
      let displayDate = '-';
      if (c.date) {
          try {
              const dateObj = new Date(c.date);
              if (!isNaN(dateObj)) {
                  displayDate = dateObj.toLocaleDateString('en-US');
              }
          } catch {
              displayDate = c.date.toString().split(' ')[0];
          }
      }

      return [
          // Take only the primary address part (before the second comma or newline)
          (c.address || '').split('\n')[0].split(',').slice(0, 2).join(','),
          c.status || 'Sold',
          `$${Number(c.price).toLocaleString()}`,
          displayDate
      ];
  });

  if (compData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Address', 'Status', 'Price', 'Date']],
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
          } catch (e) {
              console.warn(`Failed to load gallery image ${i}:`, e);
          }
      }
  }

  // Save
  doc.save(`DealReport_${deal.address.substring(0, 10)}.pdf`);
};
import jsPDF from 'jspdf';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Helper to load image from URL for PDF with Timeout & Error handling
const getImageData = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
        reject(new Error("Image Load Timeout"));
    }, timeout);

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
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller PDF size
    };
    img.onerror = (e) => {
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

  const emerald = [16, 185, 129];
  const slate = [15, 23, 42];
  const lightGray = [248, 250, 252];
  const fallbackHouse = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800";

  // --- Header & Branding ---
  if (userProfile?.logoUrl) {
    try {
      const logoData = await getImageData(userProfile.logoUrl);
      doc.addImage(logoData, 'PNG', margin, y, 25, 15, undefined, 'FAST');
    } catch { 
        console.warn("PDF Logo Load Failed"); 
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
  doc.text(`Prepared on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - margin, y + 6, { align: 'right' });
  
  y += 20;

  // --- Property Title ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slate);
  const splitAddress = doc.splitTextToSize(deal.address || 'Unknown Property', contentWidth);
  doc.text(splitAddress, margin, y);
  y += (splitAddress.length * 8) + 5;

  // --- Hero Image with Robust Fallback ---
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(deal.address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const primaryImageUrl = (deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) ? deal.imageUrls[0] : null;
  
  let heroImageData = null;
  
  // Try 1: User Image
  if (primaryImageUrl) {
      try {
          heroImageData = await getImageData(primaryImageUrl);
      } catch {
          console.warn("Primary Image failed for PDF Hero, trying StreetView...");
      }
  }

  // Try 2: StreetView (if Try 1 failed)
  if (!heroImageData) {
      try {
          heroImageData = await getImageData(streetViewUrl);
      } catch {
          console.warn("StreetView failed for PDF Hero, using Generic Placeholder...");
      }
  }

  if (heroImageData) {
    doc.addImage(heroImageData, 'JPEG', margin, y, contentWidth, 75, undefined, 'FAST');
    y += 85;
  } else {
    y += 5;
  }

  // --- Key Stat Cards ---
  const cardWidth = (contentWidth - 10) / 3;
  const drawStatCard = (label, value, x, yPos, color = slate) => {
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, yPos, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text(label.toUpperCase(), x + cardWidth/2, yPos + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.text(value, x + cardWidth/2, yPos + 16, { align: 'center' });
  };

  drawStatCard('Asking Price', `$${Number(deal.price).toLocaleString()}`, margin, y);
  drawStatCard('Est. ARV', `$${Number(deal.arv).toLocaleString()}`, margin + cardWidth + 5, y, emerald);
  drawStatCard('Target Rent', `$${Number(deal.rent).toLocaleString()}`, margin + (cardWidth * 2) + 10, y);
  
  y += 32;

  // --- Executive Summary Box ---
  if (deal.aiAnalysis?.gemini) {
    const gemini = deal.aiAnalysis.gemini;
    doc.setFillColor(...slate);
    doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...emerald);
    doc.text(`MARKET ANALYSIS VERDICT: ${gemini.verdict}`, margin + 5, y + 8);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Score: ${gemini.score}/100`, contentWidth + margin - 5, y + 10, { align: 'right' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200);
    const summaryText = gemini.summary || 'Strategic investment opportunity identified based on current market velocity and equity spread.';
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 10);
    doc.text(splitSummary, margin + 5, y + 18);
    
    y += 50;
  }

  // --- Comps Section ---
  if (deal.aiAnalysis?.market?.comps?.length > 0) {
    const comps = deal.aiAnalysis.market.comps.slice(0, 5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate);
    doc.text('RECENT SALES COMPARABLES', margin, y);
    y += 4;
    doc.setDrawColor(230);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    comps.forEach((c) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text(c.address.substring(0, 50), margin, y);
        doc.text(`$${Number(c.price).toLocaleString()}`, margin + (contentWidth * 0.7), y);
        doc.text(c.distance, margin + (contentWidth * 0.9), y, { align: 'right' });
        y += 7;
    });
    y += 10;
  }

  // --- ADD PAGE 2: PROPERTY GALLERY ---
  if (deal.imageUrls && deal.imageUrls.length > 0) {
      doc.addPage();
      let galleryY = 20;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slate);
      doc.text('PROPERTY PHOTO GALLERY', margin, galleryY);
      galleryY += 10;

      // Filter out only valid URLs (exclude picsum or empty)
      const validImages = deal.imageUrls.filter(url => !url.includes('picsum'));
      
      // Let's add up to 4 images in a grid
      const imgWidth = (contentWidth - 5) / 2;
      const imgHeight = 60;

      for (let i = 0; i < validImages.length; i++) {
          if (i > 0 && i % 4 === 0) {
              doc.addPage();
              galleryY = 20;
          }

          try {
              const imgData = await getImageData(validImages[i]);
              const xPos = margin + (i % 2 === 0 ? 0 : imgWidth + 5);
              const yPos = galleryY + (Math.floor((i % 4) / 2) * (imgHeight + 5));
              
              doc.addImage(imgData, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');
          } catch (e) {
              console.warn(`Gallery image ${i} failed to load for PDF`);
          }
      }
  }

  // --- Footer (Global for all pages) ---
  const totalPages = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Page Number
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - margin, pageHeight - 10, { align: 'right' });

      // Agent Branding (Last Page Only)
      if (i === totalPages) {
        doc.setFillColor(...lightGray);
        doc.rect(0, pageHeight - 35, doc.internal.pageSize.getWidth(), 25, 'F');
        
        let footerX = margin;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate);
        doc.text(userProfile?.displayName || 'Real Estate Professional', footerX, pageHeight - 25);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        const contactLine = [
            userProfile?.company,
            userProfile?.phone ? `Tel: ${userProfile.phone}` : null,
            userProfile?.email,
            userProfile?.website
        ].filter(Boolean).join('  •  ');
        doc.text(contactLine, footerX, pageHeight - 20);
      }
  }

  doc.save(`REI_Deal_Drop_${deal.address.substring(0, 20).replace(/\s/g, '_')}.pdf`);
};
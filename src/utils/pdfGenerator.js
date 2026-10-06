/**
 * YASH ENTERPRISE - PDF & Print Generation Utility
 * Generates crisp A5 / A4 PDFs using html2canvas & jsPDF with native print backup
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates and downloads a PDF from a DOM element
 * @param {HTMLElement} element - The DOM element to render
 * @param {string} filename - Output filename (e.g., 'WB-2026-0001.pdf')
 * @param {string} format - 'a5' | 'a4'
 * @param {string} orientation - 'portrait' | 'landscape'
 */
export async function generatePdfFromElement(element, filename = 'document.pdf', format = 'a5', orientation = 'portrait') {
  if (!element) {
    throw new Error('Element not found for PDF generation');
  }

  try {
    // Clone element styling & render at high scale for retina print quality
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Create jsPDF instance
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add image scaled to fit page margins
    const margin = 5; // 5mm margin
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Center or fit
    const posY = contentHeight < pageHeight ? margin : margin;

    pdf.addImage(imgData, 'JPEG', margin, posY, contentWidth, Math.min(contentHeight, pageHeight - margin * 2));
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF Generation failed, falling back to print dialog:', error);
    // Fallback to print
    window.print();
    return false;
  }
}

/**
 * Triggers native high-fidelity browser print
 */
export function triggerNativePrint() {
  window.print();
}

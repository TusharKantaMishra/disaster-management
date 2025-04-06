/**
 * PDF generation utilities for the disaster management application
 */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Add type declaration for jsPDF internal methods
interface jsPDFInternal {
  events: any;
  scaleFactor: number;
  pageSize: {
    width: number;
    getWidth: () => number;
    height: number;
    getHeight: () => number;
  };
  pages: any[];
  getNumberOfPages: () => number;
  getEncryptor: (objectId: number) => (data: string) => string;
}

/**
 * Generate a PDF from HTML content
 * @param contentElement The HTML element to convert to PDF
 * @param filename The name of the PDF file
 */
export const generatePdfFromHtml = async (
  contentElement: HTMLElement,
  filename: string = 'disaster-analysis-report.pdf'
): Promise<void> => {
  if (!contentElement) {
    console.error('No content element provided for PDF generation');
    return;
  }

  try {
    // Create a new PDF document in portrait, A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    // Access to internal methods
    const pdfInternal = pdf.internal as unknown as jsPDFInternal;
    const pageWidth = pdfInternal.pageSize.getWidth();
    const pageHeight = pdfInternal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text('Disaster Analysis Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    
    // Add timestamp
    const date = new Date().toLocaleString();
    pdf.text(`Generated: ${date}`, pageWidth / 2, 22, { align: 'center' });
    pdf.setLineWidth(0.5);
    pdf.line(20, 25, pageWidth - 20, 25);
    
    // Capture the content as an image using html2canvas
    const canvas = await html2canvas(contentElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });
    
    // Calculate the number of pages needed (with 35mm margins)
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 35; // Start position after the title
    
    // Add image to first page
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      10,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    
    // Add additional pages if needed
    heightLeft -= (pageHeight - position);
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        10,
        -(pageHeight - position),
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;
    }
    
    // Add footer with page numbers
    const pageCount = pdfInternal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Save the PDF
    pdf.save(filename);
    console.log(`PDF successfully generated: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate a PDF from plain text content
 * @param textContent The text content to convert to PDF
 * @param title The title for the PDF
 * @param filename The name of the PDF file
 */
export const generatePdfFromText = (
  textContent: string,
  title: string = 'Disaster Analysis',
  filename: string = 'disaster-analysis-report.pdf'
): void => {
  try {
    // Create a new PDF document in portrait, A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    // Access to internal methods
    const pdfInternal = pdf.internal as unknown as jsPDFInternal;
    const pageWidth = pdfInternal.pageSize.getWidth();
    const pageHeight = pdfInternal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    
    // Add timestamp
    const date = new Date().toLocaleString();
    pdf.text(`Generated: ${date}`, pageWidth / 2, 22, { align: 'center' });
    pdf.setLineWidth(0.5);
    pdf.line(20, 25, pageWidth - 20, 25);
    
    // Set text properties
    pdf.setFontSize(12);
    const textX = 20;
    let textY = 35;
    const lineHeight = 7;
    const maxWidth = pageWidth - 40;
    
    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(textContent, maxWidth);
    
    // Add lines to pages
    let currentPage = 1;
    
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (textY > pageHeight - 20) {
        // Add page number to current page
        pdf.setFontSize(10);
        pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Add new page
        pdf.addPage();
        currentPage++;
        textY = 20; // Reset Y position for new page
        pdf.setFontSize(12);
      }
      
      // Add the line of text
      pdf.text(lines[i], textX, textY);
      textY += lineHeight;
    }
    
    // Add page number to last page
    pdf.setFontSize(10);
    pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(filename);
    console.log(`PDF successfully generated: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

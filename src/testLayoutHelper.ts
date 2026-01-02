import { readFileSync, writeFileSync, existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { join } from 'path';

export async function createLayoutTest(
  ticketPdfPath: string,
  templatePdfPath: string = 'template.pdf',
  outputPath?: string
): Promise<string> {
  // Check if files exist
  if (!existsSync(ticketPdfPath)) {
    throw new Error(`Ticket PDF not found: ${ticketPdfPath}`);
  }

  if (!existsSync(templatePdfPath)) {
    throw new Error(`Template PDF not found: ${templatePdfPath}. Please ensure template.pdf exists in the project root.`);
  }

  // Default output path is in the same directory as the ticket PDF
  const defaultOutputPath = outputPath || join(ticketPdfPath, '..', '..', 'layout-test.pdf');

  console.log(`\nCreating layout test PDF...`);
  console.log(`  Ticket PDF: ${ticketPdfPath}`);
  console.log(`  Template PDF: ${templatePdfPath}`);

  // Load both PDFs
  const ticketPdfBytes = readFileSync(ticketPdfPath);
  const templatePdfBytes = readFileSync(templatePdfPath);

  const ticketPdf = await PDFDocument.load(ticketPdfBytes);
  const templatePdf = await PDFDocument.load(templatePdfBytes);

  // Create a new PDF for the output
  const outputPdf = await PDFDocument.create();

  // Get the first pages from template and ticket PDFs
  const templateFirstPage = templatePdf.getPage(0);
  const ticketFirstPage = ticketPdf.getPage(0);

  // Get page sizes
  const templateSize = templateFirstPage.getSize();
  const templateWidth = templateSize.width;
  const templateHeight = templateSize.height;
  
  const ticketSize = ticketFirstPage.getSize();
  const ticketWidth = ticketSize.width;
  const ticketHeight = ticketSize.height;

  // Embed pages so we can draw them on other pages
  const embeddedTemplatePage = await outputPdf.embedPage(templateFirstPage);
  const embeddedTicketPage = await outputPdf.embedPage(ticketFirstPage);

  // Create a new page with template dimensions
  const outputPage = outputPdf.addPage([templateWidth, templateHeight]);

  // Draw template page as background
  outputPage.drawPage(embeddedTemplatePage, {
    x: 0,
    y: 0,
    width: templateWidth,
    height: templateHeight,
  });

  // Overlay ticket page on top
  outputPage.drawPage(embeddedTicketPage, {
    x: 0,
    y: 0,
    width: ticketWidth,
    height: ticketHeight,
  });

  // Save the output PDF
  const pdfBytes = await outputPdf.save();
  writeFileSync(defaultOutputPath, pdfBytes);

  console.log(`✅ Layout test PDF created: ${defaultOutputPath}`);
  console.log(`  Template size: ${templateWidth.toFixed(2)} x ${templateHeight.toFixed(2)} points`);
  console.log(`  Ticket size: ${ticketWidth.toFixed(2)} x ${ticketHeight.toFixed(2)} points`);

  return defaultOutputPath;
}


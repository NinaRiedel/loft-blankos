import { readFileSync, writeFileSync } from 'fs';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

async function main() {
  try {
    // Get file paths from command line arguments
    const ticketPdfPath = process.argv[2];
    const templatePdfPath = process.argv[3] || 'template.pdf';
    const outputPath = process.argv[4] || 'layout-test.pdf';

    if (!ticketPdfPath) {
      console.error('Usage: tsx src/testLayout.ts <ticket-pdf-path> [template-pdf-path] [output-path]');
      console.error('Example: tsx src/testLayout.ts output/Adele_25.12.2026/tickets/tickets-001.pdf template.pdf layout-test.pdf');
      process.exit(1);
    }

    // Check if files exist
    if (!existsSync(ticketPdfPath)) {
      console.error(`Error: Ticket PDF not found: ${ticketPdfPath}`);
      process.exit(1);
    }

    if (!existsSync(templatePdfPath)) {
      console.error(`Error: Template PDF not found: ${templatePdfPath}`);
      console.error(`Please ensure template.pdf exists in the project root.`);
      process.exit(1);
    }

    console.log(`Reading ticket PDF: ${ticketPdfPath}`);
    console.log(`Reading template PDF: ${templatePdfPath}`);

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

    // Overlay ticket page on top (centered or positioned as needed)
    // You can adjust x, y, width, height to position the ticket
    outputPage.drawPage(embeddedTicketPage, {
      x: 0,
      y: 0,
      width: ticketWidth,
      height: ticketHeight,
    });

    // Save the output PDF
    const pdfBytes = await outputPdf.save();
    writeFileSync(outputPath, pdfBytes);

    console.log(`\n✅ Layout test PDF created: ${outputPath}`);
    console.log(`Template size: ${templateWidth.toFixed(2)} x ${templateHeight.toFixed(2)} points`);
    console.log(`Ticket size: ${ticketWidth.toFixed(2)} x ${ticketHeight.toFixed(2)} points`);
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

main();


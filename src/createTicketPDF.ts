import PDFDocument from 'pdfkit';
import { createWriteStream, mkdirSync } from 'fs';
import { dirname } from 'path';
import { TicketData, QRCodeData } from './types.js';

// A7 dimensions in points (74mm × 105mm)
const A7_WIDTH = 209.76;
const A7_HEIGHT = 297.64;
const MAX_PAGES_PER_PDF = 20;

export async function createTicketPDFs(
  tickets: TicketData[],
  qrCodes: QRCodeData[],
  outputDir: string
): Promise<string[]> {
  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  const qrCodeMap = new Map(qrCodes.map(qr => [qr.id, qr.buffer]));
  const pdfFiles: string[] = [];
  const totalPdfs = Math.ceil(tickets.length / MAX_PAGES_PER_PDF);

  for (let pdfIndex = 0; pdfIndex < totalPdfs; pdfIndex++) {
    const startIndex = pdfIndex * MAX_PAGES_PER_PDF;
    const endIndex = Math.min(startIndex + MAX_PAGES_PER_PDF, tickets.length);
    const batchTickets = tickets.slice(startIndex, endIndex);

    const pdfPath = `${outputDir}/tickets-${String(pdfIndex + 1).padStart(3, '0')}.pdf`;
    await createSinglePDF(batchTickets, qrCodeMap, pdfPath);
    pdfFiles.push(pdfPath);
  }

  return pdfFiles;
}

async function createSinglePDF(
  tickets: TicketData[],
  qrCodeMap: Map<string, Buffer>,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [A7_WIDTH, A7_HEIGHT],
      margin: 0,
    });

    const stream = createWriteStream(outputPath);
    doc.pipe(stream);

    for (const ticket of tickets) {
      // Add new page for each ticket (except the first)
      if (tickets.indexOf(ticket) > 0) {
        doc.addPage();
      }

      // Hardcoded layout
      const margin = 15;
      const qrSize = 80;
      const qrX = (A7_WIDTH - qrSize) / 2;
      const qrY = A7_HEIGHT - qrSize - margin - 30;

      // Artist name (header)
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text(ticket.artist, margin, margin, {
           width: A7_WIDTH - 2 * margin,
           align: 'center',
         });

      // Event details
      let yPos = margin + 30;
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Date: ${ticket.date}`, margin, yPos);
      
      yPos += 18;
      doc.text(`Time: ${ticket.startTime}`, margin, yPos);
      
      yPos += 18;
      doc.text(`Venue: ${ticket.venue}`, margin, yPos);
      
      yPos += 18;
      doc.text(`Category: ${ticket.category}`, margin, yPos);

      // Seat info (if enabled)
      if (ticket.seat) {
        yPos += 18;
        doc.text(`Seat: ${ticket.seat}`, margin, yPos);
      }

      // QR Code
      const qrBuffer = qrCodeMap.get(ticket.id);
      if (qrBuffer) {
        doc.image(qrBuffer, qrX, qrY, {
          width: qrSize,
          height: qrSize,
        });
      }

      // Static text (footer)
      doc.fontSize(8)
         .font('Helvetica')
         .text(ticket.staticText, margin, A7_HEIGHT - margin - 10, {
           width: A7_WIDTH - 2 * margin,
           align: 'center',
         });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}


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
  outputDir: string,
  includeQrCode: boolean = true
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
    await createSinglePDF(batchTickets, qrCodeMap, pdfPath, includeQrCode);
    pdfFiles.push(pdfPath);
  }

  return pdfFiles;
}

async function createSinglePDF(
  tickets: TicketData[],
  qrCodeMap: Map<string, Buffer>,
  outputPath: string,
  includeQrCode: boolean = true
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
      const margin = 18;
      const textMargin = 20; // More margin for text
      const qrSize = 60;
      const qrX = margin; // Left edge for QR code
      const qrY = A7_HEIGHT - qrSize - margin - 30 - 40; // Moved up by 40

      // Artist name (left-aligned, bold, larger)
      let yPos = margin + 35; // More margin above text (moved down)
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(ticket.artist, textMargin, yPos);

      // Date and time on same line with space
      yPos += 16;
      doc.font('Helvetica') // Reset to regular font
         .text(`${ticket.date} ${ticket.startTime}`, textMargin, yPos);
      
      // Venue
      yPos += 16;
      doc.text(ticket.venue, textMargin, yPos);
      
      // Category
      yPos += 16;
      doc.text(ticket.category, textMargin, yPos);

      // Seat info: Area on one line, Row and Seat on same line
      if (ticket.area) {
        yPos += 16;
        doc.text(ticket.area.trim(), textMargin, yPos);
      }
      if (ticket.row || ticket.seatNumber) {
        yPos += 16;
        const rowSeatParts: string[] = [];
        if (ticket.row) rowSeatParts.push(`Reihe ${ticket.row}`);
        if (ticket.seatNumber) rowSeatParts.push(`Platz ${ticket.seatNumber}`);
        if (rowSeatParts.length > 0) {
          doc.text(rowSeatParts.join(', '), textMargin, yPos);
        }
      }

      // QR Code (left edge, moved up) - only if enabled
      if (includeQrCode) {
        const qrBuffer = qrCodeMap.get(ticket.id);
        if (qrBuffer) {
          doc.image(qrBuffer, qrX, qrY, {
            width: qrSize,
            height: qrSize,
          });
        }
      }

      // Static text (below QR code, italic/cursive)
      const staticTextY = qrY + qrSize + 5; // Position below QR code
      doc.fontSize(8)
         .font('Helvetica-Oblique') // Italic/cursive font
         .text(ticket.staticText, textMargin, staticTextY, {
           width: A7_WIDTH - 2 * textMargin,
         });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}


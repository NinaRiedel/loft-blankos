import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TicketData } from '../types.js';

// A7 dimensions in points (74mm × 105mm)
const A7_WIDTH = 209.76;
const A7_HEIGHT = 297.64;
const MAX_PAGES_PER_PDF = 20;

export interface QRCodeData {
  id: string;
  dataUrl: string;
}

export async function createTicketPDFs(
  tickets: TicketData[],
  qrCodes: QRCodeData[],
  includeQrCode: boolean = true
): Promise<Uint8Array[]> {
  const qrCodeMap = new Map(qrCodes.map(qr => [qr.id, qr.dataUrl]));
  const pdfs: Uint8Array[] = [];
  const totalPdfs = Math.ceil(tickets.length / MAX_PAGES_PER_PDF);

  for (let pdfIndex = 0; pdfIndex < totalPdfs; pdfIndex++) {
    const startIndex = pdfIndex * MAX_PAGES_PER_PDF;
    const endIndex = Math.min(startIndex + MAX_PAGES_PER_PDF, tickets.length);
    const batchTickets = tickets.slice(startIndex, endIndex);

    const pdfBytes = await createSinglePDF(batchTickets, qrCodeMap, includeQrCode);
    pdfs.push(pdfBytes);
  }

  return pdfs;
}

async function createSinglePDF(
  tickets: TicketData[],
  qrCodeMap: Map<string, string>,
  includeQrCode: boolean = true
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    
    // Add new page for each ticket
    const page = pdfDoc.addPage([A7_WIDTH, A7_HEIGHT]);
    const { width, height } = page.getSize();

    // Layout constants
    const margin = 18;
    const textMargin = 20;
    const qrSize = 60;
    const qrX = margin;
    const qrY = height - qrSize - margin - 30 - 40;

    // Artist name (left-aligned, bold, dynamic size based on length)
    let yPos = height - (margin + 35);
    const artistFontSize = ticket.artist.length > 21 ? 10 : 12;
    page.drawText(ticket.artist, {
      x: textMargin,
      y: yPos,
      size: artistFontSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Date and venue on same line
    yPos -= 16;
    page.drawText(`${ticket.date}     ${ticket.venue}`, {
      x: textMargin,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Start time
    yPos -= 16;
    page.drawText(`${ticket.startTime} Uhr`, {
      x: textMargin,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Category
    yPos -= 16;
    page.drawText(ticket.category, {
      x: textMargin,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Seat info: Area on one line, Row and Seat on same line
    if (ticket.area) {
      yPos -= 16;
      page.drawText(ticket.area.trim(), {
        x: textMargin,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
    if (ticket.row || ticket.seatNumber) {
      yPos -= 16;
      const rowSeatParts: string[] = [];
      if (ticket.row) rowSeatParts.push(`Reihe ${ticket.row}`);
      if (ticket.seatNumber) rowSeatParts.push(`Platz ${ticket.seatNumber}`);
      if (rowSeatParts.length > 0) {
        page.drawText(rowSeatParts.join(', '), {
          x: textMargin,
          y: yPos,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // QR Code - only if enabled
    if (includeQrCode) {
      const qrDataUrl = qrCodeMap.get(ticket.id);
      if (qrDataUrl) {
        try {
          // Convert data URL to image
          // Data URL format: "data:image/png;base64,..."
          const base64Data = qrDataUrl.split(',')[1];
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const qrImage = await pdfDoc.embedPng(imageBytes);
          
          page.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });
        } catch (error) {
          console.error(`Failed to embed QR code for ticket ${ticket.id}:`, error);
        }
      }
    }

    // Static text (below QR code, italic)
    const staticTextY = qrY - 10; // Position below QR code
    page.drawText(ticket.staticText, {
      x: textMargin,
      y: staticTextY,
      size: 8,
      font: helveticaObliqueFont,
      color: rgb(0, 0, 0),
      maxWidth: width - 2 * textMargin,
    });
  }

  return await pdfDoc.save();
}


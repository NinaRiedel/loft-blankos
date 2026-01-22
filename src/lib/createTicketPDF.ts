import { PageSizes, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TicketData } from '../types.js';

// A7 dimensions in points (74mm × 105mm)
// const A7_WIDTH = 209.76;
// const A7_HEIGHT = 297.64;
const MAX_PAGES_PER_PDF = 20;

export interface QRCodeData {
        id: string;
        dataUrl: string;
}

export async function createPreviewPDFWithTemplate(
        ticketPdfBytes: Uint8Array,
        templatePdfBytes: Uint8Array
): Promise<Uint8Array> {
        const ticketPdf = await PDFDocument.load(ticketPdfBytes);
        const templatePdf = await PDFDocument.load(templatePdfBytes);
        const outputPdf = await PDFDocument.create();

        const ticketPage = ticketPdf.getPage(0);
        const templatePage = templatePdf.getPage(0);

        const ticketSize = ticketPage.getSize();
        const templateSize = templatePage.getSize();

        const embeddedTemplatePage = await outputPdf.embedPage(templatePage);
        const embeddedTicketPage = await outputPdf.embedPage(ticketPage);

        const outputPage = outputPdf.addPage([ticketSize.width, ticketSize.height]);

        outputPage.drawPage(embeddedTemplatePage, {
                x: 0,
                y: ticketSize.height - templateSize.height,
                width: templateSize.width,
                height: templateSize.height,
        });

        outputPage.drawPage(embeddedTicketPage, {
                x: 0,
                y: 0,
                width: ticketSize.width,
                height: ticketSize.height,
        });

        return await outputPdf.save();
}

export async function createTicketPDFs(
        tickets: TicketData[],
        qrCodes: QRCodeData[],
        includeQrCode: boolean = true
): Promise<Uint8Array[]> {
        const qrCodeMap = new Map(qrCodes.map(qr => [qr.id, qr.dataUrl]));
        const ticketPdfs: Uint8Array[] = [];
        const totalPdfs = Math.ceil(tickets.length / MAX_PAGES_PER_PDF);

        for (let pdfIndex = 0; pdfIndex < totalPdfs; pdfIndex++) {
                const startIndex = pdfIndex * MAX_PAGES_PER_PDF;
                const endIndex = Math.min(startIndex + MAX_PAGES_PER_PDF, tickets.length);
                const batchTickets = tickets.slice(startIndex, endIndex);

                const pdfBytes = await createSinglePDF(batchTickets, qrCodeMap, includeQrCode);
                ticketPdfs.push(pdfBytes);
        }

        return ticketPdfs;
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

                const page = pdfDoc.addPage(PageSizes.A4);
                const { width, height } = page.getSize();

        // Layout constants (values are unchanged; use top-origin for clarity)
        const margin = 18;
        const textMargin = 20;
        const qrSize = 50;
        const qrLeft = 18;
        const lineHeight = 16;
        const topPadding = margin + 40;
        const staticTextTopOffset = 223;

        const yFromTop = (topOffset: number) => height - topOffset;

        // Artist name (left-aligned, bold, dynamic size based on length)
        let yPos = yFromTop(topPadding);
                const artistFontSize = ticket.artist.length > 21 ? 10 : 12;
                page.drawText(ticket.artist, {
                        x: textMargin,
                        y: yPos,
                        size: artistFontSize,
                        font: helveticaBoldFont,
                        color: rgb(0, 0, 0),
                });

                // Date and venue on same line
        yPos -= lineHeight;
                page.drawText(`${ticket.date}     ${ticket.venue}`, {
                        x: textMargin,
                        y: yPos,
                        size: 10,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                });

                // Start time
        yPos -= lineHeight;
                page.drawText(`${ticket.startTime} Uhr`, {
                        x: textMargin,
                        y: yPos,
                        size: 10,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                });

                // Category
        yPos -= lineHeight;
                page.drawText(ticket.category, {
                        x: textMargin,
                        y: yPos,
                        size: 10,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                });

                // Seat info: Area on one line, then either customLine or Row/Seat
                if (ticket.area) {
                yPos -= lineHeight;
                        page.drawText(ticket.area.trim(), {
                                x: textMargin,
                                y: yPos,
                                size: 10,
                                font: helveticaFont,
                                color: rgb(0, 0, 0),
                        });
                }

                // Custom line for manual seating (displayed as-is)
                if (ticket.customLine) {
                yPos -= lineHeight;
                        page.drawText(ticket.customLine, {
                                x: textMargin,
                                y: yPos,
                                size: 10,
                                font: helveticaFont,
                                color: rgb(0, 0, 0),
                        });
                } else if (ticket.row || ticket.seatNumber) {
                        // Standard row/seat with prefixes
                yPos -= lineHeight;
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

                // QR Code - positioned right after the text content
                if (includeQrCode) {
                        const qrDataUrl = qrCodeMap.get(ticket.id);
                        if (qrDataUrl) {
                                try {
                                        // Position QR below the last text element
                                        yPos -= lineHeight; // Gap before QR
                                        const qrY = yPos - qrSize;

                                        // Convert data URL to image
                                        // Data URL format: "data:image/png;base64,..."
                                        const base64Data = qrDataUrl.split(',')[1];
                                        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                                        const qrImage = await pdfDoc.embedPng(imageBytes);

                                        page.drawImage(qrImage, {
                                                x: qrLeft,
                                                y: qrY,
                                                width: qrSize,
                                                height: qrSize,
                                        });
                                } catch (error) {
                                        console.error(`Failed to embed QR code for ticket ${ticket.id}:`, error);
                                }
                        }
                }

                // Static text - fixed position at bottom (does not move with QR code)
                const staticTextY = yFromTop(staticTextTopOffset);
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


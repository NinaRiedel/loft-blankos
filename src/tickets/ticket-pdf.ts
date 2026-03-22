import {PageSizes, PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import {getTicketSeatLines, type Ticket} from './ticket.js';
import type {TicketQrCode} from './ticket-qr-code.js';

const MAX_TICKETS_PER_PDF = 20;
const PREVIEW_ZOOM = 120;

function decodePngDataUrl(dataUrl: string): Uint8Array {
    const [, base64Data = ''] = dataUrl.split(',');
    return Uint8Array.from(atob(base64Data), character =>
        character.charCodeAt(0),
    );
}

export async function createPreviewPdfWithTemplate(
    ticketPdfBytes: Uint8Array,
    templatePdfBytes: Uint8Array,
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

    return outputPdf.save();
}

export async function createTicketPdfFiles(
    tickets: Ticket[],
    qrCodes: TicketQrCode[],
    includeQrCode: boolean,
): Promise<Uint8Array[]> {
    const qrCodesById = new Map(
        qrCodes.map(qrCode => [qrCode.id, qrCode.dataUrl]),
    );
    const ticketPdfFiles: Uint8Array[] = [];
    const totalPdfs = Math.ceil(tickets.length / MAX_TICKETS_PER_PDF);

    for (let pdfIndex = 0; pdfIndex < totalPdfs; pdfIndex += 1) {
        const startIndex = pdfIndex * MAX_TICKETS_PER_PDF;
        const endIndex = Math.min(
            startIndex + MAX_TICKETS_PER_PDF,
            tickets.length,
        );
        ticketPdfFiles.push(
            await createSingleTicketPdf(
                tickets.slice(startIndex, endIndex),
                qrCodesById,
                includeQrCode,
            ),
        );
    }

    return ticketPdfFiles;
}

async function createSingleTicketPdf(
    tickets: Ticket[],
    qrCodesById: Map<string, string>,
    includeQrCode: boolean,
): Promise<Uint8Array> {
    const pdfDocument = await PDFDocument.create();
    const helveticaFont = await pdfDocument.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDocument.embedFont(
        StandardFonts.HelveticaBold,
    );
    const helveticaObliqueFont = await pdfDocument.embedFont(
        StandardFonts.HelveticaOblique,
    );

    for (const ticket of tickets) {
        const page = pdfDocument.addPage(PageSizes.A4);
        const {height, width} = page.getSize();

        const margin = 18;
        const textMargin = 20;
        const qrSize = 50;
        const qrLeft = 18;
        const lineHeight = 16;
        const topPadding = margin + 40;
        const staticTextTopOffset = 223;
        const yFromTop = (topOffset: number) => height - topOffset;

        let yPosition = yFromTop(topPadding);

        page.drawText(ticket.artist, {
            x: textMargin,
            y: yPosition,
            size: ticket.artist.length > 21 ? 10 : 12,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;
        page.drawText(`${ticket.date}     ${ticket.venue}`, {
            x: textMargin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;
        page.drawText(`${ticket.startTime} Uhr`, {
            x: textMargin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;
        page.drawText(ticket.category, {
            x: textMargin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        for (const line of getTicketSeatLines(ticket)) {
            yPosition -= lineHeight;
            page.drawText(line, {
                x: textMargin,
                y: yPosition,
                size: 10,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
        }

        if (includeQrCode) {
            const qrCodeDataUrl = qrCodesById.get(ticket.id);

            if (qrCodeDataUrl) {
                try {
                    yPosition -= lineHeight;
                    const qrImage = await pdfDocument.embedPng(
                        decodePngDataUrl(qrCodeDataUrl),
                    );

                    page.drawImage(qrImage, {
                        x: qrLeft,
                        y: yPosition - qrSize,
                        width: qrSize,
                        height: qrSize,
                    });
                } catch (error) {
                    console.error(
                        `Failed to embed QR code for ticket ${ticket.id}:`,
                        error,
                    );
                }
            }
        }

        page.drawText(ticket.staticText, {
            x: textMargin,
            y: yFromTop(staticTextTopOffset),
            size: 8,
            font: helveticaObliqueFont,
            color: rgb(0, 0, 0),
            maxWidth: width - 2 * textMargin,
        });
    }

    return pdfDocument.save();
}

export async function createDigitalExportPdf(
    ticketPdfFiles: Uint8Array[],
    templatePdfBytes: Uint8Array,
): Promise<Uint8Array> {
    const outputPdf = await PDFDocument.create();
    const templatePdf = await PDFDocument.load(templatePdfBytes);
    const templateSize = templatePdf.getPage(0).getSize();
    const [a4Width, a4Height] = PageSizes.A4;

    const embeddedTemplatePage = await outputPdf.embedPage(
        templatePdf.getPage(0),
    );

    for (const ticketPdfFile of ticketPdfFiles) {
        const ticketPdf = await PDFDocument.load(ticketPdfFile);

        for (let i = 0; i < ticketPdf.getPageCount(); i += 1) {
            // Crop ticket page to the template's content area (top-left corner)
            const embeddedTicketPage = await outputPdf.embedPage(
                ticketPdf.getPage(i),
                {
                    left: 0,
                    bottom: a4Height - templateSize.height,
                    right: templateSize.width,
                    top: a4Height,
                },
            );

            const outputPage = outputPdf.addPage(PageSizes.A4);

            outputPage.drawPage(embeddedTemplatePage, {
                x: 0,
                y: 0,
                width: a4Width,
                height: a4Height,
            });

            outputPage.drawPage(embeddedTicketPage, {
                x: 0,
                y: 0,
                width: a4Width,
                height: a4Height,
            });
        }
    }

    return outputPdf.save();
}

export function getPreviewPdfUrl(objectUrl: string): string {
    return `${objectUrl}#page=1&zoom=${PREVIEW_ZOOM}`;
}

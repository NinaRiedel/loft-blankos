import {useEffect, useState} from 'react';
import {PDFDocument} from 'pdf-lib';
import {
    createPreviewPdfWithTemplate,
    getPreviewPdfUrl,
} from '../tickets/ticket-pdf.js';

interface PreviewPdfState {
    previewPdfBytes: Uint8Array | null;
    previewUrl: string | null;
}

export function usePreviewPdf(
    ticketPdfFiles: Uint8Array[] | null,
    templatePdfBytes: Uint8Array | null,
): PreviewPdfState {
    const [previewPdfBytes, setPreviewPdfBytes] = useState<Uint8Array | null>(
        null,
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!ticketPdfFiles || ticketPdfFiles.length === 0) {
            setPreviewPdfBytes(null);
            setPreviewUrl(null);
            return;
        }

        let isActive = true;
        let objectUrl: string | null = null;

        const buildPreview = async () => {
            const nextPreviewPdfBytes = templatePdfBytes
                ? await createPreviewPdfWithTemplate(
                      ticketPdfFiles[0],
                      templatePdfBytes,
                  )
                : await extractFirstPage(ticketPdfFiles[0]);

            if (!isActive) {
                return;
            }

            objectUrl = URL.createObjectURL(
                new Blob([nextPreviewPdfBytes as BlobPart], {
                    type: 'application/pdf',
                }),
            );

            setPreviewPdfBytes(nextPreviewPdfBytes);
            setPreviewUrl(getPreviewPdfUrl(objectUrl));
        };

        void buildPreview();

        return () => {
            isActive = false;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [templatePdfBytes, ticketPdfFiles]);

    return {
        previewPdfBytes,
        previewUrl,
    };
}

async function extractFirstPage(pdfBytes: Uint8Array): Promise<Uint8Array> {
    const sourcePdf = await PDFDocument.load(pdfBytes);
    const outputPdf = await PDFDocument.create();
    const [page] = await outputPdf.copyPages(sourcePdf, [0]);
    outputPdf.addPage(page);
    return outputPdf.save();
}

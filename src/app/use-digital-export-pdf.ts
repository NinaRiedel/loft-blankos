import {useEffect, useState} from 'react';
import {createDigitalExportPdf} from '../tickets/ticket-pdf.js';

export function useDigitalExportPdf(
    ticketPdfFiles: Uint8Array[] | null,
    templatePdfBytes: Uint8Array | null,
): Uint8Array | null {
    const [digitalExportPdfBytes, setDigitalExportPdfBytes] =
        useState<Uint8Array | null>(null);

    useEffect(() => {
        if (
            !ticketPdfFiles ||
            ticketPdfFiles.length === 0 ||
            !templatePdfBytes
        ) {
            setDigitalExportPdfBytes(null);
            return;
        }

        let isActive = true;

        const build = async () => {
            const bytes = await createDigitalExportPdf(
                ticketPdfFiles,
                templatePdfBytes,
            );

            if (isActive) {
                setDigitalExportPdfBytes(bytes);
            }
        };

        void build();

        return () => {
            isActive = false;
        };
    }, [ticketPdfFiles, templatePdfBytes]);

    return digitalExportPdfBytes;
}

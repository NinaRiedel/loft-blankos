import {useEffect, useEffectEvent, useRef, useState} from 'react';
import {SeatingSection} from '../seating/seating-section.js';
import type {TicketPlacement} from '../seating/ticket-placement.js';
import {buildTickets, type Ticket} from '../tickets/ticket.js';
import {TicketConfigForm} from '../tickets/ticket-config-form.js';
import {
    defaultTicketForm,
    getTicketFormErrors,
    type TicketForm,
} from '../tickets/ticket-form.js';
import {createTicketPdfFiles} from '../tickets/ticket-pdf.js';
import {generateTicketQrCodes} from '../tickets/ticket-qr-code.js';
import {OutputPanel} from './output-panel.js';
import {useDigitalExportPdf} from './use-digital-export-pdf.js';
import {usePreviewPdf} from './use-preview-pdf.js';
import {useTemplatePdf} from './use-template-pdf.js';

function App() {
    const [ticketForm, setTicketForm] = useState<TicketForm>(defaultTicketForm);
    const [ticketPlacements, setTicketPlacements] = useState<
        TicketPlacement[] | null
    >(null);
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [ticketPdfFiles, setTicketPdfFiles] = useState<Uint8Array[] | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [customTemplatePdfBytes, setCustomTemplatePdfBytes] =
        useState<Uint8Array | null>(null);
    const [customTemplateFileName, setCustomTemplateFileName] = useState<
        string | null
    >(null);
    const defaultTemplatePdfBytes = useTemplatePdf();
    const templatePdfBytes = customTemplatePdfBytes ?? defaultTemplatePdfBytes;
    const {previewPdfBytes: printPreviewPdfBytes} = usePreviewPdf(
        ticketPdfFiles,
        templatePdfBytes,
    );
    const digitalExportPdfBytes = useDigitalExportPdf(
        ticketPdfFiles,
        templatePdfBytes,
    );
    const generationIdRef = useRef(0);

    const ticketFormErrors = getTicketFormErrors(ticketForm);
    const hasTicketFormErrors = Object.keys(ticketFormErrors).length > 0;

    const generateArtifacts = useEffectEvent(async () => {
        if (!ticketPlacements || ticketPlacements.length === 0) {
            return;
        }

        const generationId = ++generationIdRef.current;

        try {
            const nextTickets = buildTickets(ticketForm, ticketPlacements);
            if (generationId !== generationIdRef.current) {
                return;
            }

            setTickets(nextTickets);

            const qrCodes = await generateTicketQrCodes(
                nextTickets.map(ticket => ticket.id),
            );
            if (generationId !== generationIdRef.current) {
                return;
            }

            const nextTicketPdfFiles = await createTicketPdfFiles(
                nextTickets,
                qrCodes,
                ticketForm.includeQrCode,
            );
            if (generationId !== generationIdRef.current) {
                return;
            }

            setTicketPdfFiles(nextTicketPdfFiles);
        } catch (nextError) {
            if (generationId === generationIdRef.current) {
                setTickets(null);
                setTicketPdfFiles(null);
                setError(
                    nextError instanceof Error
                        ? nextError.message
                        : 'Failed to generate tickets',
                );
            }
        }
    });

    useEffect(() => {
        if (!ticketPlacements || ticketPlacements.length === 0) {
            generationIdRef.current += 1;
            setTickets(null);
            setTicketPdfFiles(null);
            setError(
                'Bitte Sitzplatzdaten hochladen oder manuell konfigurieren',
            );
            return;
        }

        if (hasTicketFormErrors) {
            generationIdRef.current += 1;
            setTickets(null);
            setTicketPdfFiles(null);
            setError('Please fill in all highlighted fields');
            return;
        }

        setError(null);

        const timeout = window.setTimeout(() => {
            void generateArtifacts();
        }, 400);

        return () => {
            generationIdRef.current += 1;
            window.clearTimeout(timeout);
        };
    }, [hasTicketFormErrors, ticketForm, ticketPlacements]);

    return (
        <div className="app">
            <h1>Loft Blankos</h1>

            <div className="app-layout">
                <div className="app-main">
                    <TicketConfigForm
                        form={ticketForm}
                        validationErrors={ticketFormErrors}
                        onChange={setTicketForm}
                    />

                    <SeatingSection onPlacementsChange={setTicketPlacements} />

                    {error && <div className="error">{error}</div>}
                </div>

                <div className="app-sidebar">
                    {ticketPdfFiles && (
                        <OutputPanel
                            ticketPdfFiles={ticketPdfFiles}
                            tickets={tickets}
                            artistName={ticketForm.event.artist}
                            eventDate={ticketForm.event.date}
                            printPreviewPdfBytes={printPreviewPdfBytes}
                            digitalExportPdfBytes={digitalExportPdfBytes}
                            customTemplatePdfBytes={customTemplatePdfBytes}
                            customTemplateFileName={customTemplateFileName}
                            onCustomTemplateChange={(bytes, fileName) => {
                                setCustomTemplatePdfBytes(bytes);
                                setCustomTemplateFileName(fileName);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;

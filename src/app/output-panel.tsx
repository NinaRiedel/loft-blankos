import JSZip from 'jszip';
import {Archive, Download, FileDown} from 'lucide-react';
import {PDFDocument} from 'pdf-lib';
import {useEffect, useState} from 'react';
import {
    downloadBlob,
    downloadTextFile,
} from '../platform/browser/download-file.js';
import type {Ticket} from '../tickets/ticket.js';
import {renderTicketCsv} from '../tickets/ticket-csv.js';
import {
    getDigitalExportPdfFileName,
    getDigitalExportZipFileName,
    getPreviewPdfFileName,
    getTicketCsvFileName,
    getTicketPdfFileName,
    getTicketZipFileName,
} from '../tickets/ticket-file-name.js';
import {getPreviewPdfUrl} from '../tickets/ticket-pdf.js';

type OutputTab = 'print' | 'digital';

interface OutputPanelProps {
    ticketPdfFiles: Uint8Array[];
    tickets: Ticket[] | null;
    artistName: string;
    eventDate: string;
    printPreviewPdfBytes: Uint8Array | null;
    digitalExportPdfBytes: Uint8Array | null;
    customTemplatePdfBytes: Uint8Array | null;
    customTemplateFileName: string | null;
    onCustomTemplateChange: (
        bytes: Uint8Array | null,
        fileName: string | null,
    ) => void;
}

export function OutputPanel({
    ticketPdfFiles,
    tickets,
    artistName,
    eventDate,
    printPreviewPdfBytes,
    digitalExportPdfBytes,
    customTemplatePdfBytes,
    customTemplateFileName,
    onCustomTemplateChange,
}: OutputPanelProps) {
    const [tab, setTab] = useState<OutputTab>('print');
    const digitalPreviewPdfBytes = useFirstPage(digitalExportPdfBytes);
    const printPreviewUrl = usePreviewUrl(printPreviewPdfBytes);
    const digitalPreviewUrl = usePreviewUrl(digitalPreviewPdfBytes);
    const previewUrl = tab === 'print' ? printPreviewUrl : digitalPreviewUrl;
    const previewPdfBytes =
        tab === 'print' ? printPreviewPdfBytes : digitalPreviewPdfBytes;

    const handleDownloadAll = async () => {
        if (tab === 'print') {
            for (let index = 0; index < ticketPdfFiles.length; index += 1) {
                downloadPdf(
                    ticketPdfFiles[index],
                    getTicketPdfFileName(artistName, eventDate, index),
                );
                await new Promise(resolve => window.setTimeout(resolve, 300));
            }

            if (tickets) {
                downloadTextFile(
                    renderTicketCsv(tickets),
                    getTicketCsvFileName(artistName, eventDate),
                );
            }
        } else {
            if (digitalExportPdfBytes) {
                downloadPdf(
                    digitalExportPdfBytes,
                    getDigitalExportPdfFileName(artistName, eventDate),
                );
            }

            if (tickets) {
                downloadTextFile(
                    renderTicketCsv(tickets),
                    getTicketCsvFileName(artistName, eventDate),
                );
            }
        }
    };

    const handleDownloadZip = async () => {
        const zipFile = new JSZip();

        if (tab === 'print') {
            ticketPdfFiles.forEach((file, index) => {
                zipFile.file(getTicketPdfFileName(artistName, eventDate, index), file);
            });
        } else if (digitalExportPdfBytes) {
            zipFile.file(
                getDigitalExportPdfFileName(artistName, eventDate),
                digitalExportPdfBytes,
            );
        }

        if (tickets) {
            zipFile.file(
                getTicketCsvFileName(artistName, eventDate),
                renderTicketCsv(tickets),
            );
        }

        downloadBlob(
            await zipFile.generateAsync({type: 'blob'}),
            tab === 'print'
                ? getTicketZipFileName(artistName, eventDate)
                : getDigitalExportZipFileName(artistName, eventDate),
        );
    };

    return (
        <div className="output-panel">
            <div className="output-section">
                <h3>Template</h3>
                <div className="template-upload">
                    <label htmlFor="template-upload" className="upload-area">
                        <input
                            id="template-upload"
                            type="file"
                            accept=".pdf"
                            style={{display: 'none'}}
                            onChange={event => {
                                const file = event.target.files?.[0];
                                if (!file) {
                                    return;
                                }

                                void file.arrayBuffer().then(buffer => {
                                    onCustomTemplateChange(
                                        new Uint8Array(buffer),
                                        file.name,
                                    );
                                });
                            }}
                        />
                        {customTemplateFileName ? (
                            <span>✓ {customTemplateFileName}</span>
                        ) : (
                            <span>Eigenes Template hochladen (.pdf)</span>
                        )}
                    </label>
                    {customTemplatePdfBytes && (
                        <button
                            type="button"
                            className="reset-template-btn"
                            onClick={() => onCustomTemplateChange(null, null)}
                        >
                            Standard-Template verwenden
                        </button>
                    )}
                </div>
            </div>

            <div className="output-tabs">
                <button
                    type="button"
                    className={`tab-btn ${tab === 'print' ? 'active' : ''}`}
                    onClick={() => setTab('print')}
                >
                    Print
                </button>
                <button
                    type="button"
                    className={`tab-btn ${tab === 'digital' ? 'active' : ''}`}
                    onClick={() => setTab('digital')}
                >
                    Digital
                </button>
            </div>

            <div className="output-section">
                <h3>Downloads</h3>
                <div className="download-buttons">
                    <div className="download-bulk-buttons">
                        <button
                            type="button"
                            onClick={handleDownloadAll}
                            className="download-btn download-all-btn"
                        >
                            <Download size={16} /> Alle
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadZip}
                            className="download-btn download-zip-btn"
                        >
                            <Archive size={16} /> Alle als ZIP
                        </button>
                    </div>

                    {tab === 'print' ? (
                        <PrintDownloads
                            ticketPdfFiles={ticketPdfFiles}
                            tickets={tickets}
                            artistName={artistName}
                            eventDate={eventDate}
                        />
                    ) : (
                        <DigitalDownloads
                            digitalExportPdfBytes={digitalExportPdfBytes}
                            tickets={tickets}
                            artistName={artistName}
                            eventDate={eventDate}
                        />
                    )}
                </div>
            </div>

            <div className="output-section">
                <h3>Preview</h3>
                <button
                    type="button"
                    className="download-btn preview-download-btn"
                    disabled={!previewPdfBytes}
                    onClick={() => {
                        if (previewPdfBytes) {
                            downloadPdf(
                                previewPdfBytes,
                                getPreviewPdfFileName(artistName || 'preview', eventDate),
                            );
                        }
                    }}
                >
                    <FileDown size={16} />{' '}
                    {getPreviewPdfFileName(artistName || 'preview', eventDate)}
                </button>
                {previewUrl ? (
                    <iframe
                        title="Ticket PDF preview"
                        src={previewUrl}
                        className="pdf-preview-frame"
                    />
                ) : (
                    <p>Keine Vorschau verfügbar.</p>
                )}
            </div>
        </div>
    );
}

function PrintDownloads({
    ticketPdfFiles,
    tickets,
    artistName,
    eventDate,
}: {
    ticketPdfFiles: Uint8Array[];
    tickets: Ticket[] | null;
    artistName: string;
    eventDate: string;
}) {
    return (
        <>
            {tickets && (
                <button
                    type="button"
                    onClick={() =>
                        downloadTextFile(
                            renderTicketCsv(tickets),
                            getTicketCsvFileName(artistName, eventDate),
                        )
                    }
                    className="download-btn download-csv-btn"
                >
                    <FileDown size={16} /> {getTicketCsvFileName(artistName, eventDate)}
                </button>
            )}
            {ticketPdfFiles.map((file, index) => (
                <button
                    type="button"
                    key={getTicketPdfFileName(artistName, eventDate, index)}
                    onClick={() =>
                        downloadPdf(
                            file,
                            getTicketPdfFileName(artistName, eventDate, index),
                        )
                    }
                    className="download-btn"
                >
                    <FileDown size={16} />{' '}
                    {getTicketPdfFileName(artistName, eventDate, index)}
                </button>
            ))}
        </>
    );
}

function DigitalDownloads({
    digitalExportPdfBytes,
    tickets,
    artistName,
    eventDate,
}: {
    digitalExportPdfBytes: Uint8Array | null;
    tickets: Ticket[] | null;
    artistName: string;
    eventDate: string;
}) {
    if (!digitalExportPdfBytes) {
        return <p>Kein Template verfügbar.</p>;
    }

    return (
        <>
            {tickets && (
                <button
                    type="button"
                    onClick={() =>
                        downloadTextFile(
                            renderTicketCsv(tickets),
                            getTicketCsvFileName(artistName, eventDate),
                        )
                    }
                    className="download-btn download-csv-btn"
                >
                    <FileDown size={16} /> {getTicketCsvFileName(artistName, eventDate)}
                </button>
            )}
            <button
                type="button"
                onClick={() =>
                    downloadPdf(
                        digitalExportPdfBytes,
                        getDigitalExportPdfFileName(artistName, eventDate),
                    )
                }
                className="download-btn"
            >
                <FileDown size={16} /> {getDigitalExportPdfFileName(artistName, eventDate)}
            </button>
        </>
    );
}

function downloadPdf(bytes: Uint8Array, fileName: string) {
    downloadBlob(
        new Blob([bytes as BlobPart], {type: 'application/pdf'}),
        fileName,
    );
}

function useFirstPage(
    pdfBytes: Uint8Array | null,
): Uint8Array | null {
    const [firstPageBytes, setFirstPageBytes] = useState<Uint8Array | null>(
        null,
    );

    useEffect(() => {
        if (!pdfBytes) {
            setFirstPageBytes(null);
            return;
        }

        let isActive = true;

        void PDFDocument.load(pdfBytes).then(async sourcePdf => {
            const outputPdf = await PDFDocument.create();
            const [page] = await outputPdf.copyPages(sourcePdf, [0]);
            outputPdf.addPage(page);
            const bytes = await outputPdf.save();

            if (isActive) {
                setFirstPageBytes(bytes);
            }
        });

        return () => {
            isActive = false;
        };
    }, [pdfBytes]);

    return firstPageBytes;
}

function usePreviewUrl(pdfBytes: Uint8Array | null | undefined): string | null {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!pdfBytes) {
            setUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(
            new Blob([pdfBytes as BlobPart], {type: 'application/pdf'}),
        );
        setUrl(getPreviewPdfUrl(objectUrl));

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [pdfBytes]);

    return url;
}

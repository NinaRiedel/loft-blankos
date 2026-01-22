import { useState, useEffect, useRef } from 'react';
import { TicketConfig, TicketData, SeatInfo } from './types.js';
import { TicketConfigForm } from './components/TicketConfigForm.js';
import { SeatingSection } from './components/SeatingSection.js';
import { PreviewSection } from './components/PreviewSection.js';
import { DownloadSection } from './components/DownloadSection.js';
import { generateIds } from './lib/generateIds.js';
import { generateQRCodes } from './lib/generateQRCodes.js';
import { createPreviewPDFWithTemplate, createTicketPDFs } from './lib/createTicketPDF.js';
import { downloadBlob } from './lib/downloadUtils.js';
import { normalizeName } from './lib/normalizeName.js';

const PREVIEW_ZOOM = 120;

function formatSeatInfo(seatInfo: { area?: string; row?: string; seat?: string }): string | undefined {
  const parts: string[] = [];
  if (seatInfo.area) parts.push(seatInfo.area);
  if (seatInfo.row) parts.push(`Reihe ${seatInfo.row}`);
  if (seatInfo.seat) parts.push(`Platz ${seatInfo.seat}`);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function getMissingFields(config: Omit<TicketConfig, 'seatingFile'>): string[] {
  const missing: string[] = [];
  if (!config.event.artist) missing.push('artist');
  if (!config.event.date) missing.push('date');
  if (!config.event.startTime) missing.push('startTime');
  if (!config.event.venue) missing.push('venue');
  if (!config.staticText) missing.push('staticText');
  return missing;
}

function App() {
  const [config, setConfig] = useState<Omit<TicketConfig, 'seatingFile'>>({
    includeQrCode: true,
    event: {
      artist: '',
      date: '',
      startTime: '',
      venue: '',
      category: '',
    },
    staticText: 'Der Weiterverkauf dieses Tickets ist untersagt.',
  });

  const [seatingData, setSeatingData] = useState<SeatInfo[] | null>(null);
  const [tickets, setTickets] = useState<TicketData[] | null>(null);
  const [pdfs, setPdfs] = useState<Uint8Array[] | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewPdfBytes, setPreviewPdfBytes] = useState<Uint8Array | null>(null);
  const [templatePdf, setTemplatePdf] = useState<Uint8Array | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const generationIdRef = useRef(0);
  const previewGenerationIdRef = useRef(0);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}template.pdf`)
      .then(res => {
        if (res.ok) return res.arrayBuffer();
        throw new Error('Template not found');
      })
      .then(buffer => setTemplatePdf(new Uint8Array(buffer)))
      .catch(() => {
        setTemplatePdf(null);
      });
  }, []);

  useEffect(() => {
    if (!pdfs || pdfs.length === 0) {
      setPdfPreviewUrl(null);
      setPreviewPdfBytes(null);
      return;
    }

    const previewId = ++previewGenerationIdRef.current;
    let isActive = true;
    let objectUrl: string | null = null;

    const buildPreview = async () => {
      const previewBytes = templatePdf
        ? await createPreviewPDFWithTemplate(pdfs[0], templatePdf)
        : pdfs[0];

      if (!isActive || previewId !== previewGenerationIdRef.current) {
        return;
      }

      const blob = new Blob([previewBytes as BlobPart], { type: 'application/pdf' });
      objectUrl = URL.createObjectURL(blob);
      setPdfPreviewUrl(`${objectUrl}#page=1&zoom=${PREVIEW_ZOOM}`);
      setPreviewPdfBytes(previewBytes);
    };

    void buildPreview();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfs, templatePdf]);

  const generateTickets = async (showErrors: boolean) => {
    const missing = getMissingFields(config);
    if (showErrors) {
      setMissingFields(missing);
    }

    if (!seatingData || seatingData.length === 0) {
      if (showErrors) {
        setError('Bitte Sitzplatzdaten hochladen oder manuell konfigurieren');
      }
      return;
    }

    if (missing.length > 0) {
      if (showErrors) {
        setError('Please fill in all highlighted fields');
      }
      return;
    }

    const generationId = ++generationIdRef.current;
    setIsGenerating(true);
    if (showErrors) {
      setError(null);
    }

    try {
      // Generate IDs
      const ids = generateIds(seatingData.length);

      // Prepare ticket data
      const ticketData: TicketData[] = ids.map((id, index) => {
        const seat = seatingData[index];
        const isManual = seat.status === 'manual';
        
        return {
          id,
          artist: config.event.artist,
          date: config.event.date,
          startTime: config.event.startTime,
          venue: config.event.venue,
          category: seat.category || config.event.category,
          seat: isManual ? undefined : formatSeatInfo(seat),
          staticText: config.staticText,
          area: seat.area,
          row: isManual ? undefined : seat.row,
          seatNumber: isManual ? undefined : seat.seat,
          customLine: isManual ? seat.seat : undefined, // line2 stored in seat for manual mode
        };
      });

      if (generationId !== generationIdRef.current) return;
      setTickets(ticketData);

      // Generate QR codes
      const qrCodes = await generateQRCodes(ids);
      if (generationId !== generationIdRef.current) return;

      // Generate PDFs
      const ticketPdfs = await createTicketPDFs(ticketData, qrCodes, config.includeQrCode);
      if (generationId !== generationIdRef.current) return;

      setPdfs(ticketPdfs);
    } catch (err) {
      if (showErrors) {
        setError(err instanceof Error ? err.message : 'Failed to generate tickets');
      }
    } finally {
      if (generationId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    const missing = getMissingFields(config);
    setMissingFields(missing);

    if (!seatingData || seatingData.length === 0) {
      setError('Bitte Sitzplatzdaten hochladen oder manuell konfigurieren');
      return;
    }

    if (missing.length > 0) {
      setError('Please fill in all highlighted fields');
      return;
    }

    setError(null);
    const timeout = window.setTimeout(() => {
      void generateTickets(false);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [config, seatingData]);

  const handleDownloadPreview = () => {
    if (!previewPdfBytes) return;
    const normalizedArtist = normalizeName(config.event.artist || 'preview');
    const blob = new Blob([previewPdfBytes as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, `preview-${normalizedArtist}.pdf`);
  };

  return (
    <div className="app">
      <h1>Loft Blankos</h1>

      <div className="app-layout">
        <div className="app-main">
          <TicketConfigForm config={config} onChange={(newConfig) => {
            setConfig(newConfig);
            setMissingFields([]); // Clear validation on change
          }} missingFields={missingFields} />

          <SeatingSection onSeatingDataChange={setSeatingData} />

          <PreviewSection seatingData={seatingData} />

          {error && <div className="error">{error}</div>}
        </div>

        <div className="app-sidebar">
          {pdfs && (
            <div className="output-panel">
              <DownloadSection pdfs={pdfs} tickets={tickets} artistName={config.event.artist} />
              <div className="pdf-preview-card">
                <h2>Preview</h2>
                <button
                  onClick={handleDownloadPreview}
                  className="download-btn preview-download-btn"
                  disabled={!previewPdfBytes}
                >
                  Preview PDF herunterladen
                </button>
                {pdfPreviewUrl ? (
                  <iframe
                    title="Ticket PDF preview"
                    src={pdfPreviewUrl}
                    className="pdf-preview-frame"
                  />
                ) : (
                  <p>Keine Vorschau verfügbar.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

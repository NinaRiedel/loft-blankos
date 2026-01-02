import { useState, useEffect } from 'react';
import { TicketConfig, TicketData, SeatInfo } from './types.js';
import { TicketConfigForm } from './components/TicketConfigForm.js';
import { SeatingSection } from './components/SeatingSection.js';
import { PreviewSection } from './components/PreviewSection.js';
import { DownloadSection } from './components/DownloadSection.js';
import { generateIds } from './lib/generateIds.js';
import { generateQRCodes } from './lib/generateQRCodes.js';
import { createTicketPDFs } from './lib/createTicketPDF.js';

function formatSeatInfo(seatInfo: { area?: string; row?: string; seat?: string }): string | undefined {
  const parts: string[] = [];
  if (seatInfo.area) parts.push(seatInfo.area);
  if (seatInfo.row) parts.push(`Reihe ${seatInfo.row}`);
  if (seatInfo.seat) parts.push(`Platz ${seatInfo.seat}`);
  return parts.length > 0 ? parts.join(', ') : undefined;
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
  const [layoutTestPdf, setLayoutTestPdf] = useState<Uint8Array | null>(null);
  const [templatePdf, setTemplatePdf] = useState<Uint8Array | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Load template.pdf on mount
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}template.pdf`)
      .then(res => {
        if (res.ok) return res.arrayBuffer();
        throw new Error('Template not found');
      })
      .then(buffer => setTemplatePdf(new Uint8Array(buffer)))
      .catch(() => {
        console.log('template.pdf not found, layout test will be disabled');
      });
  }, []);

  const handleGenerate = async () => {
    // Check for missing fields
    const missing: string[] = [];
    if (!config.event.artist) missing.push('artist');
    if (!config.event.date) missing.push('date');
    if (!config.event.startTime) missing.push('startTime');
    if (!config.event.venue) missing.push('venue');
    if (!config.staticText) missing.push('staticText');
    
    setMissingFields(missing);

    if (!seatingData || seatingData.length === 0) {
      setError('Bitte Sitzplatzdaten hochladen oder manuell konfigurieren');
      return;
    }

    if (missing.length > 0) {
      setError('Please fill in all highlighted fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

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

      setTickets(ticketData);

      // Generate QR codes
      const qrCodes = await generateQRCodes(ids);

      // Generate PDFs (with optional layout test)
      const result = await createTicketPDFs(ticketData, qrCodes, config.includeQrCode, templatePdf);
      setPdfs(result.ticketPdfs);
      setLayoutTestPdf(result.layoutTestPdf);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tickets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <h1>Loft Blankos</h1>

      <TicketConfigForm config={config} onChange={(newConfig) => {
        setConfig(newConfig);
        setMissingFields([]); // Clear validation on change
      }} missingFields={missingFields} />

      <SeatingSection onSeatingDataChange={setSeatingData} />

      <PreviewSection seatingData={seatingData} />

      <div className="generate-section">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !seatingData || seatingData.length === 0}
          className="generate-btn"
        >
          {isGenerating ? 'Generieren...' : 'Tickets generieren'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {pdfs && <DownloadSection pdfs={pdfs} tickets={tickets} layoutTestPdf={layoutTestPdf} artistName={config.event.artist} />}
    </div>
  );
}

export default App;

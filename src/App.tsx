import { useState } from 'react';
import { TicketConfig, TicketData, SeatInfo } from './types.js';
import { TicketConfigForm } from './components/TicketConfigForm.js';
import { FileUpload } from './components/FileUpload.js';
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
    staticText: '',
  });

  const [seatingData, setSeatingData] = useState<SeatInfo[] | null>(null);
  const [tickets, setTickets] = useState<TicketData[] | null>(null);
  const [pdfs, setPdfs] = useState<Uint8Array[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!seatingData || seatingData.length === 0) {
      setError('Please upload a seating file first');
      return;
    }

    if (!config.event.artist || !config.event.date || !config.event.startTime || !config.event.venue || !config.event.category || !config.staticText) {
      setError('Please fill in all required fields');
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
        return {
          id,
          artist: config.event.artist,
          date: config.event.date,
          startTime: config.event.startTime,
          venue: config.event.venue,
          category: seat.category || config.event.category,
          seat: formatSeatInfo(seat),
          staticText: config.staticText,
          area: seat.area,
          row: seat.row,
          seatNumber: seat.seat,
        };
      });

      setTickets(ticketData);

      // Generate QR codes
      const qrCodes = await generateQRCodes(ids);

      // Generate PDFs
      const pdfBytes = await createTicketPDFs(ticketData, qrCodes, config.includeQrCode);
      setPdfs(pdfBytes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tickets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <h1>QR Ticket Generator</h1>

      <TicketConfigForm config={config} onChange={setConfig} />

      <FileUpload onSeatingDataParsed={setSeatingData} />

      <PreviewSection seatingData={seatingData} />

      <div className="generate-section">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !seatingData || seatingData.length === 0}
          className="generate-btn"
        >
          {isGenerating ? 'Generating...' : 'Generate Tickets'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {pdfs && <DownloadSection pdfs={pdfs} tickets={tickets} />}
    </div>
  );
}

export default App;

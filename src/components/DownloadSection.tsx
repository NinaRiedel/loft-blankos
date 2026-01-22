import { downloadBlob, downloadText } from '../lib/downloadUtils.js';
import { exportToCsv } from '../lib/exportCsv.js';
import { normalizeName } from '../lib/normalizeName.js';
import { TicketData } from '../types.js';
import JSZip from 'jszip';

interface DownloadSectionProps {
  pdfs: Uint8Array[] | null;
  tickets: TicketData[] | null;
  artistName: string;
}

export function DownloadSection({ pdfs, tickets, artistName }: DownloadSectionProps) {
  if (!pdfs || pdfs.length === 0) {
    return null;
  }

  const normalizedArtist = normalizeName(artistName);

  const handleDownloadPDF = (pdfBytes: Uint8Array, index: number) => {
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const filename = `tickets-${normalizedArtist}-${index + 1}.pdf`;
    downloadBlob(blob, filename);
  };

  const handleDownloadCSV = () => {
    if (!tickets) return;
    const csvContent = exportToCsv(tickets);
    downloadText(csvContent, `barcodes-${normalizedArtist}.csv`);
  };

  const handleDownloadAll = async () => {
    // Download all ticket PDFs
    for (let i = 0; i < pdfs.length; i++) {
      const blob = new Blob([pdfs[i] as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `tickets-${normalizedArtist}-${i + 1}.pdf`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Download CSV last
    if (tickets) {
      const csvContent = exportToCsv(tickets);
      downloadText(csvContent, `barcodes-${normalizedArtist}.csv`);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();

    // Add all ticket PDFs
    pdfs.forEach((pdf, index) => {
      zip.file(`tickets-${normalizedArtist}-${index + 1}.pdf`, pdf);
    });

    // Add CSV if available
    if (tickets) {
      const csvContent = exportToCsv(tickets);
      zip.file(`barcodes-${normalizedArtist}.csv`, csvContent);
    }

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `tickets-${normalizedArtist}.zip`);
  };

  return (
    <div className="download-section">
      <h2>Downloads</h2>
      <div className="download-buttons">
        <button onClick={handleDownloadAll} className="download-btn download-all-btn">
          Alle herunterladen
        </button>
        <button onClick={handleDownloadZip} className="download-btn download-zip-btn">
          Alle als ZIP herunterladen
        </button>
        <div className="pdf-downloads">
          <h3>PDF Files ({pdfs.length})</h3>
          {pdfs.map((pdf, index) => (
            <button
              key={index}
              onClick={() => handleDownloadPDF(pdf, index)}
              className="download-btn"
            >
              Download tickets-{normalizedArtist}-{index + 1}.pdf
            </button>
          ))}
        </div>
        {tickets && (
          <div className="csv-download">
            <h3>CSV File</h3>
            <button onClick={handleDownloadCSV} className="download-btn">
              Download barcodes-{normalizedArtist}.csv
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


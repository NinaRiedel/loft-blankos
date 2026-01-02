import { downloadBlob, downloadText } from '../lib/downloadUtils.js';
import { exportToCsv } from '../lib/exportCsv.js';
import { TicketData } from '../types.js';

interface DownloadSectionProps {
  pdfs: Uint8Array[] | null;
  tickets: TicketData[] | null;
}

export function DownloadSection({ pdfs, tickets }: DownloadSectionProps) {
  if (!pdfs || pdfs.length === 0) {
    return null;
  }

  const handleDownloadPDF = (pdfBytes: Uint8Array, index: number) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const filename = `tickets-${String(index + 1).padStart(3, '0')}.pdf`;
    downloadBlob(blob, filename);
  };

  const handleDownloadCSV = () => {
    if (!tickets) return;
    const csvContent = exportToCsv(tickets);
    downloadText(csvContent, 'ids.csv');
  };

  return (
    <div className="download-section">
      <h2>Downloads</h2>
      <div className="download-buttons">
        <div className="pdf-downloads">
          <h3>PDF Files ({pdfs.length})</h3>
          {pdfs.map((pdf, index) => (
            <button
              key={index}
              onClick={() => handleDownloadPDF(pdf, index)}
              className="download-btn"
            >
              Download tickets-{String(index + 1).padStart(3, '0')}.pdf
            </button>
          ))}
        </div>
        {tickets && (
          <div className="csv-download">
            <h3>CSV File</h3>
            <button onClick={handleDownloadCSV} className="download-btn">
              Download ids.csv
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


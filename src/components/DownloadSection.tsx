import { downloadBlob, downloadText } from '../lib/downloadUtils.js';
import { exportToCsv } from '../lib/exportCsv.js';
import { TicketData } from '../types.js';

interface DownloadSectionProps {
  pdfs: Uint8Array[] | null;
  tickets: TicketData[] | null;
  layoutTestPdf: Uint8Array | null;
}

export function DownloadSection({ pdfs, tickets, layoutTestPdf }: DownloadSectionProps) {
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

  const handleDownloadLayoutTest = () => {
    if (!layoutTestPdf) return;
    const blob = new Blob([layoutTestPdf], { type: 'application/pdf' });
    downloadBlob(blob, 'layout-test.pdf');
  };

  const handleDownloadAll = async () => {
    // Download layout test first if available
    if (layoutTestPdf) {
      const blob = new Blob([layoutTestPdf], { type: 'application/pdf' });
      downloadBlob(blob, 'layout-test.pdf');
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Download all ticket PDFs
    for (let i = 0; i < pdfs.length; i++) {
      const blob = new Blob([pdfs[i]], { type: 'application/pdf' });
      downloadBlob(blob, `tickets-${String(i + 1).padStart(3, '0')}.pdf`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Download CSV last
    if (tickets) {
      const csvContent = exportToCsv(tickets);
      downloadText(csvContent, 'ids.csv');
    }
  };

  return (
    <div className="download-section">
      <h2>Downloads</h2>
      <div className="download-buttons">
        <button onClick={handleDownloadAll} className="download-btn download-all-btn">
          Alle herunterladen
        </button>

        {layoutTestPdf && (
          <div className="layout-test-download">
            <h3>Layout Test</h3>
            <button onClick={handleDownloadLayoutTest} className="download-btn layout-btn">
              Download layout-test.pdf
            </button>
            <p className="hint">First ticket overlaid on template for alignment check</p>
          </div>
        )}
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


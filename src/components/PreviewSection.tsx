import { SeatInfo } from '../types.js';

interface PreviewSectionProps {
  seatingData: SeatInfo[] | null;
}

export function PreviewSection({ seatingData }: PreviewSectionProps) {
  if (!seatingData || seatingData.length === 0) {
    return null;
  }

  const isManual = seatingData[0]?.status === 'manual';

  return (
    <div className="preview-section">
      <h2>Vorschau</h2>
      <p><strong>{seatingData.length}</strong> Tickets</p>
      {!isManual && seatingData.length > 0 && (
        <div className="preview-sample">
          <h3>Beispiel (erste 3):</h3>
          <ul>
            {seatingData.slice(0, 3).map((seat, index) => (
              <li key={index}>
                {seat.area && `${seat.area} `}
                {seat.row && `Reihe ${seat.row} `}
                {seat.seat && `Platz ${seat.seat} `}
                {seat.category && `- ${seat.category}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isManual && (
        <div className="preview-sample">
          <p>
            {seatingData[0].area && <span>Zeile 1: {seatingData[0].area}<br/></span>}
            {seatingData[0].seat && <span>Zeile 2: {seatingData[0].seat}</span>}
          </p>
        </div>
      )}
    </div>
  );
}


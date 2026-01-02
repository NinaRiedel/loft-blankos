import { SeatInfo } from '../types.js';

interface PreviewSectionProps {
  seatingData: SeatInfo[] | null;
}

export function PreviewSection({ seatingData }: PreviewSectionProps) {
  if (!seatingData || seatingData.length === 0) {
    return null;
  }

  return (
    <div className="preview-section">
      <h2>Preview</h2>
      <p>Found <strong>{seatingData.length}</strong> seats</p>
      {seatingData.length > 0 && (
        <div className="preview-sample">
          <h3>Sample (first 3 seats):</h3>
          <ul>
            {seatingData.slice(0, 3).map((seat, index) => (
              <li key={index}>
                {seat.area && `${seat.area} `}
                {seat.row && `Reihe ${seat.row} `}
                {seat.seat && `Platz ${seat.seat} `}
                - {seat.category} ({seat.status})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


import {formatSeatInfo} from './seat-info.js';
import {
    isManualTicketPlacement,
    type TicketPlacement,
} from './ticket-placement.js';

interface SeatingPreviewProps {
    placements: TicketPlacement[] | null;
}

export function SeatingPreview({placements}: SeatingPreviewProps) {
    if (!placements || placements.length === 0) {
        return null;
    }

    const firstPlacement = placements[0];

    return (
        <div className="preview-section">
            <h2>Vorschau</h2>
            <p>
                <strong>{placements.length}</strong> Tickets
            </p>

            {isManualTicketPlacement(firstPlacement) ? (
                <div className="preview-sample">
                    <p>
                        {firstPlacement.line1 && (
                            <span>
                                Zeile 1: {firstPlacement.line1}
                                <br />
                            </span>
                        )}
                        {firstPlacement.line2 && (
                            <span>Zeile 2: {firstPlacement.line2}</span>
                        )}
                    </p>
                </div>
            ) : (
                <div className="preview-sample">
                    <h3>Beispiel (erste 3):</h3>
                    <ul>
                        {placements.slice(0, 3).map(placement => (
                            <li
                                key={
                                    placement.kind === 'assigned'
                                        ? [
                                              placement.category,
                                              placement.area,
                                              placement.row,
                                              placement.seatNumber,
                                              placement.availability,
                                          ].join(':')
                                        : [
                                              placement.line1,
                                              placement.line2,
                                          ].join(':')
                                }
                            >
                                {placement.kind === 'assigned'
                                    ? [
                                          formatSeatInfo(placement),
                                          placement.category
                                              ? `- ${placement.category}`
                                              : undefined,
                                      ]
                                          .filter((part): part is string =>
                                              Boolean(part),
                                          )
                                          .join(' ')
                                    : null}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

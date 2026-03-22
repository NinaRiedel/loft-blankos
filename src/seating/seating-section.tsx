import {useEffect, useState} from 'react';
import {ManualSeatingForm} from './manual-seating-form.js';
import {
    createManualTicketPlacements,
    defaultManualSeatingForm,
    type ManualSeatingForm as ManualSeatingFormValue,
} from './manual-ticket-placement.js';
import {formatSeatInfo} from './seat-info.js';
import {SeatingFileUpload} from './seating-file-upload.js';
import {
    isManualTicketPlacement,
    type TicketPlacement,
} from './ticket-placement.js';

type SeatingSource = 'manual' | 'upload';

interface SeatingSectionProps {
    onPlacementsChange: (placements: TicketPlacement[] | null) => void;
}

export function SeatingSection({onPlacementsChange}: SeatingSectionProps) {
    const [source, setSource] = useState<SeatingSource>('manual');
    const [manualForm, setManualForm] = useState<ManualSeatingFormValue>(
        defaultManualSeatingForm,
    );

    const [placements, setPlacements] = useState<TicketPlacement[] | null>(
        null,
    );

    useEffect(() => {
        if (source === 'manual') {
            const nextPlacements = createManualTicketPlacements(manualForm);
            setPlacements(nextPlacements);
            onPlacementsChange(nextPlacements);
        }
    }, [manualForm, onPlacementsChange, source]);

    const handleSeatsParsed = (parsed: TicketPlacement[]) => {
        setPlacements(parsed);
        onPlacementsChange(parsed);
    };

    return (
        <div className="seating-section">
            <h2>Sitzplatzdaten</h2>

            <div className="seating-toggle">
                <button
                    type="button"
                    className={`toggle-btn ${source === 'manual' ? 'active' : ''}`}
                    onClick={() => setSource('manual')}
                >
                    Manuell
                </button>

                <span className="toggle-divider">oder</span>

                <button
                    type="button"
                    className={`toggle-btn ${source === 'upload' ? 'active' : ''}`}
                    onClick={() => {
                        setSource('upload');
                        setPlacements(null);
                        onPlacementsChange(null);
                    }}
                >
                    Datei hochladen
                </button>
            </div>

            <div className="seating-content">
                {source === 'upload' ? (
                    <SeatingFileUpload onSeatsParsed={handleSeatsParsed} />
                ) : (
                    <ManualSeatingForm
                        form={manualForm}
                        onChange={setManualForm}
                    />
                )}
            </div>

            {placements && placements.length > 0 && (
                <SeatingPreviewSummary placements={placements} />
            )}
        </div>
    );
}

function SeatingPreviewSummary({placements}: {placements: TicketPlacement[]}) {
    const firstPlacement = placements[0];

    return (
        <div className="preview-section">
            <h3>Vorschau</h3>
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

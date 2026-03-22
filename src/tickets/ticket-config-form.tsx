import type {TicketForm, TicketFormErrors} from './ticket-form.js';

interface TicketConfigFormProps {
    form: TicketForm;
    validationErrors: TicketFormErrors;
    onChange: (form: TicketForm) => void;
}

export function TicketConfigForm({
    form,
    validationErrors,
    onChange,
}: TicketConfigFormProps) {
    const updateEvent = (field: keyof TicketForm['event'], value: string) => {
        onChange({
            ...form,
            event: {
                ...form.event,
                [field]: value,
            },
        });
    };

    const hasError = (field: keyof TicketFormErrors) =>
        Boolean(validationErrors[field]);

    return (
        <div className="form-section">
            <h2>Veranstaltungsdaten</h2>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="artist">Artist</label>
                    <input
                        id="artist"
                        type="text"
                        value={form.event.artist}
                        onChange={event =>
                            updateEvent('artist', event.target.value)
                        }
                        className={hasError('artist') ? 'missing' : ''}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Datum</label>
                    <input
                        id="date"
                        type="date"
                        value={form.event.date}
                        onChange={event =>
                            updateEvent('date', event.target.value)
                        }
                        className={hasError('date') ? 'missing' : ''}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="startTime">Startzeit</label>
                    <div className="input-with-suffix">
                        <input
                            id="startTime"
                            type="text"
                            value={form.event.startTime}
                            onChange={event =>
                                updateEvent('startTime', event.target.value)
                            }
                            className={hasError('startTime') ? 'missing' : ''}
                        />
                        <span className="input-suffix">Uhr</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="venue">Venue</label>
                    <input
                        id="venue"
                        type="text"
                        value={form.event.venue}
                        onChange={event =>
                            updateEvent('venue', event.target.value)
                        }
                        className={hasError('venue') ? 'missing' : ''}
                    />
                </div>

                <div className="form-group full-width">
                    <label htmlFor="staticText">Statischer Text</label>
                    <textarea
                        id="staticText"
                        value={form.staticText}
                        rows={2}
                        onChange={event =>
                            onChange({
                                ...form,
                                staticText: event.target.value,
                            })
                        }
                        className={hasError('staticText') ? 'missing' : ''}
                    />
                </div>

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={form.includeQrCode}
                            onChange={event =>
                                onChange({
                                    ...form,
                                    includeQrCode: event.target.checked,
                                })
                            }
                        />
                        QR-Code auf Tickets drucken (scannbar)?
                    </label>
                </div>
            </div>
        </div>
    );
}

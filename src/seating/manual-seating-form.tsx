import type {ManualSeatingForm as ManualSeatingFormValue} from './manual-ticket-placement.js';

interface ManualSeatingFormProps {
    form: ManualSeatingFormValue;
    onChange: (form: ManualSeatingFormValue) => void;
}

export function ManualSeatingForm({form, onChange}: ManualSeatingFormProps) {
    return (
        <div className="manual-config-fields">
            <div className="form-group">
                <label htmlFor="ticketCount">Anzahl Tickets</label>
                <input
                    id="ticketCount"
                    type="number"
                    min={1}
                    max={1000}
                    value={form.ticketCount}
                    onChange={event =>
                        onChange({
                            ...form,
                            ticketCount: Math.max(
                                1,
                                Number.parseInt(event.target.value, 10) || 1,
                            ),
                        })
                    }
                />
            </div>

            <div className="form-group">
                <label htmlFor="line1">Zeile 1 (optional)</label>
                <input
                    id="line1"
                    type="text"
                    value={form.line1}
                    onChange={event =>
                        onChange({
                            ...form,
                            line1: event.target.value,
                        })
                    }
                />
            </div>

            <div className="form-group">
                <label htmlFor="line2">Zeile 2 (optional)</label>
                <input
                    id="line2"
                    type="text"
                    value={form.line2}
                    onChange={event =>
                        onChange({
                            ...form,
                            line2: event.target.value,
                        })
                    }
                />
            </div>
        </div>
    );
}

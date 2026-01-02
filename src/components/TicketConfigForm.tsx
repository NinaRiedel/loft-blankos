import { TicketConfig } from '../types.js';

interface TicketConfigFormProps {
  config: Omit<TicketConfig, 'seatingFile'>;
  onChange: (config: Omit<TicketConfig, 'seatingFile'>) => void;
  missingFields?: string[];
}

export function TicketConfigForm({ config, onChange, missingFields = [] }: TicketConfigFormProps) {
  const updateEvent = (field: keyof TicketConfig['event'], value: string) => {
    onChange({
      ...config,
      event: {
        ...config.event,
        [field]: value,
      },
    });
  };

  const updateConfig = (field: keyof Omit<TicketConfig, 'seatingFile' | 'event'>, value: string | boolean) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const isMissing = (field: string) => missingFields.includes(field);

  return (
    <div className="form-section">
      <h2>Veranstaltungsdaten</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            value={config.event.artist}
            onChange={(e) => updateEvent('artist', e.target.value)}
            className={isMissing('artist') ? 'missing' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Datum</label>
          <input
            id="date"
            type="text"
            value={config.event.date}
            onChange={(e) => updateEvent('date', e.target.value)}
            className={isMissing('date') ? 'missing' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Startzeit</label>
          <input
            id="startTime"
            type="text"
            value={config.event.startTime}
            onChange={(e) => updateEvent('startTime', e.target.value)}
            className={isMissing('startTime') ? 'missing' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="venue">Venue</label>
          <input
            id="venue"
            type="text"
            value={config.event.venue}
            onChange={(e) => updateEvent('venue', e.target.value)}
            className={isMissing('venue') ? 'missing' : ''}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="staticText">Statischer Text</label>
          <textarea
            id="staticText"
            value={config.staticText}
            onChange={(e) => updateConfig('staticText', e.target.value)}
            rows={2}
            className={isMissing('staticText') ? 'missing' : ''}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.includeQrCode}
              onChange={(e) => updateConfig('includeQrCode', e.target.checked)}
            />
            QR-Code auf Tickets drucken (scannbar)?
          </label>
        </div>
      </div>
    </div>
  );
}


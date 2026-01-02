import { TicketConfig } from '../types.js';

interface TicketConfigFormProps {
  config: Omit<TicketConfig, 'seatingFile'>;
  onChange: (config: Omit<TicketConfig, 'seatingFile'>) => void;
}

export function TicketConfigForm({ config, onChange }: TicketConfigFormProps) {
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

  return (
    <div className="form-section">
      <h2>Event Configuration</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            value={config.event.artist}
            onChange={(e) => updateEvent('artist', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="text"
            value={config.event.date}
            onChange={(e) => updateEvent('date', e.target.value)}
            placeholder="25.12.2026"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="text"
            value={config.event.startTime}
            onChange={(e) => updateEvent('startTime', e.target.value)}
            placeholder="20:00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="venue">Venue</label>
          <input
            id="venue"
            type="text"
            value={config.event.venue}
            onChange={(e) => updateEvent('venue', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            value={config.event.category}
            onChange={(e) => updateEvent('category', e.target.value)}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="staticText">Static Text</label>
          <textarea
            id="staticText"
            value={config.staticText}
            onChange={(e) => updateConfig('staticText', e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.includeQrCode}
              onChange={(e) => updateConfig('includeQrCode', e.target.checked)}
            />
            Include QR Code in PDFs
          </label>
        </div>
      </div>
    </div>
  );
}


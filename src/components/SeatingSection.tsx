import { useState } from 'react';
import { FileUpload } from './FileUpload.js';
import { ManualSeatingConfig } from './ManualSeatingConfig.js';
import { SeatInfo } from '../types.js';

type SeatingMode = 'upload' | 'manual';

interface SeatingSectionProps {
  onSeatingDataChange: (data: SeatInfo[] | null) => void;
}

export function SeatingSection({ onSeatingDataChange }: SeatingSectionProps) {
  const [mode, setMode] = useState<SeatingMode>('upload');
  const [ticketCount, setTicketCount] = useState(1);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  const handleModeChange = (newMode: SeatingMode) => {
    setMode(newMode);
    // Clear data when switching modes
    if (newMode === 'upload') {
      onSeatingDataChange(null);
    } else {
      // Generate manual seating data
      updateManualSeating(ticketCount, line1, line2);
    }
  };

  const updateManualSeating = (count: number, l1: string, l2: string) => {
    const seats: SeatInfo[] = Array.from({ length: count }, () => ({
      area: l1 || undefined,
      row: undefined, // Don't use row for manual - use customLine via status
      seat: l2 || undefined, // Store line2 in seat field, will be mapped to customLine
      category: '',
      status: 'manual',
    }));
    onSeatingDataChange(seats);
  };

  const handleTicketCountChange = (count: number) => {
    setTicketCount(count);
    if (mode === 'manual') {
      updateManualSeating(count, line1, line2);
    }
  };

  const handleLine1Change = (value: string) => {
    setLine1(value);
    if (mode === 'manual') {
      updateManualSeating(ticketCount, value, line2);
    }
  };

  const handleLine2Change = (value: string) => {
    setLine2(value);
    if (mode === 'manual') {
      updateManualSeating(ticketCount, line1, value);
    }
  };

  return (
    <div className="seating-section">
      <h2>Sitzplatzdaten</h2>
      <div className="seating-toggle">
        <button
          className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => handleModeChange('upload')}
        >
          Datei hochladen
        </button>
        <span className="toggle-divider">oder</span>
        <button
          className={`toggle-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => handleModeChange('manual')}
        >
          Manuell
        </button>
      </div>

      <div className="seating-content">
        {mode === 'upload' ? (
          <FileUpload onSeatingDataParsed={onSeatingDataChange} />
        ) : (
          <ManualSeatingConfig
            ticketCount={ticketCount}
            line1={line1}
            line2={line2}
            onTicketCountChange={handleTicketCountChange}
            onLine1Change={handleLine1Change}
            onLine2Change={handleLine2Change}
          />
        )}
      </div>
    </div>
  );
}


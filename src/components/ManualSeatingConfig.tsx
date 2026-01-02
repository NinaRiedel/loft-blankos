interface ManualSeatingConfigProps {
  ticketCount: number;
  line1: string;
  line2: string;
  onTicketCountChange: (count: number) => void;
  onLine1Change: (line1: string) => void;
  onLine2Change: (line2: string) => void;
}

export function ManualSeatingConfig({
  ticketCount,
  line1,
  line2,
  onTicketCountChange,
  onLine1Change,
  onLine2Change,
}: ManualSeatingConfigProps) {
  return (
    <div className="manual-config-fields">
      <div className="form-group">
        <label htmlFor="ticketCount">Anzahl Tickets</label>
        <input
          id="ticketCount"
          type="number"
          min={1}
          max={1000}
          value={ticketCount}
          onChange={(e) => onTicketCountChange(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>
      <div className="form-group">
        <label htmlFor="line1">Zeile 1</label>
        <input
          id="line1"
          type="text"
          value={line1}
          onChange={(e) => onLine1Change(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="line2">Zeile 2</label>
        <input
          id="line2"
          type="text"
          value={line2}
          onChange={(e) => onLine2Change(e.target.value)}
        />
      </div>
    </div>
  );
}


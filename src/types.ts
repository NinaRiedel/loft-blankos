export interface TicketConfig {
  ticketCount: number;
  event: {
    artist: string;
    date: string;
    startTime: string;
    venue: string;
    category: string;
  };
  seatInfo: {
    enabled: boolean;
    template: string;
  };
  staticText: string;
}

export interface TicketData {
  id: string;
  artist: string;
  date: string;
  startTime: string;
  venue: string;
  category: string;
  seat?: string;
  staticText: string;
}

export interface QRCodeData {
  id: string;
  buffer: Buffer;
}


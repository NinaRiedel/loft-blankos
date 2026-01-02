export interface TicketConfig {
  seatingFile: string; // Path to seating file (required)
  includeQrCode: boolean; // Whether to include QR codes in PDFs
  event: {
    artist: string;
    date: string;
    startTime: string;
    venue: string;
    category: string;
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
  seat?: string; // Formatted seat string for CSV
  staticText: string;
  area?: string;
  row?: string;
  seatNumber?: string; // Individual seat number
}

export interface QRCodeData {
  id: string;
  buffer: Buffer;
}

export interface SeatInfo {
  area?: string;
  row?: string;
  seat?: string;
  category: string;
  status: string;
}

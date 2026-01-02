import { TicketData } from '../types.js';

export function exportToCsv(tickets: TicketData[]): string {
  const headers = [
    'ID',
    'Artist',
    'Date',
    'StartTime',
    'Venue',
    'Category',
    'Seat',
    'Area',
    'Row',
    'SeatNumber',
    'StaticText',
  ];

  const rows = tickets.map(ticket => [
    ticket.id,
    ticket.artist,
    ticket.date,
    ticket.startTime,
    ticket.venue,
    ticket.category,
    ticket.seat || '',
    ticket.area || '',
    ticket.row || '',
    ticket.seatNumber || '',
    ticket.staticText,
  ]);

  // Escape CSV values (handle quotes and commas)
  const escapeCsvValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvRows = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(',')),
  ];

  return csvRows.join('\n');
}


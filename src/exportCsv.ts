import { createObjectCsvWriter } from 'csv-writer';
import { TicketData } from './types.js';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

export async function exportToCsv(
  tickets: TicketData[],
  outputPath: string
): Promise<void> {
  // Ensure directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'artist', title: 'Artist' },
      { id: 'date', title: 'Date' },
      { id: 'startTime', title: 'StartTime' },
      { id: 'venue', title: 'Venue' },
      { id: 'category', title: 'Category' },
      { id: 'seat', title: 'Seat' },
      { id: 'area', title: 'Area' },
      { id: 'row', title: 'Row' },
      { id: 'seatNumber', title: 'SeatNumber' },
      { id: 'staticText', title: 'StaticText' },
    ],
  });

  await csvWriter.writeRecords(tickets);
}


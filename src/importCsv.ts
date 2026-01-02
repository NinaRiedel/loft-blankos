import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { TicketData } from './types.js';

export function importFromCsv(csvPath: string): TicketData[] {
  const fileContent = readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((record: any) => ({
    id: record.ID || record.id,
    artist: record.Artist || record.artist,
    date: record.Date || record.date,
    startTime: record.StartTime || record.startTime,
    venue: record.Venue || record.venue,
    category: record.Category || record.category,
    seat: record.Seat || record.seat || undefined,
    area: record.Area || record.area || undefined,
    row: record.Row || record.row || undefined,
    staticText: record.StaticText || record.staticText || '',
  }));
}


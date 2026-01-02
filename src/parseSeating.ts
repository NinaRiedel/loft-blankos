import Papa from 'papaparse';
import { SeatInfo } from './types.js';

/**
 * Extract area, row, and seat from description
 * Example: " Tribüne K  Reihe 8   Platz 1" -> area: "Tribüne K", row: "8", seat: "1"
 */
function parseDescription(description: string): { area?: string; row?: string; seat?: string } {
  const trimmed = description.trim();
  
  // Handle special case: "Innenraum Stehplatz  Reihe  Tisch  Platz (100 Stapelplätze)"
  if (trimmed.includes('Stapelplätze')) {
    return {}; // Return empty for special case
  }

  // Pattern: " Tribüne K  Reihe 8   Platz 1"
  // Try to match: area, "Reihe" + number, "Platz" + number
  const reiheMatch = trimmed.match(/Reihe\s+(\d+)/i);
  const platzMatch = trimmed.match(/Platz\s+(\d+)/i);
  
  let area: string | undefined;
  const row = reiheMatch ? reiheMatch[1] : undefined;
  const seat = platzMatch ? platzMatch[1] : undefined;

  // Extract area (everything before "Reihe")
  if (reiheMatch && reiheMatch.index !== undefined) {
    const areaPart = trimmed.substring(0, reiheMatch.index);
    // Remove any leading/trailing spaces and normalize internal spaces
    area = areaPart ? areaPart.replace(/\s+/g, ' ').trim() : undefined;
  }

  return { area, row, seat };
}

/**
 * Extract category name from category field
 * Example: "1:Sitzplatz" -> "Sitzplatz", "2:Stehplatz Innenraum" -> "Stehplatz Innenraum"
 */
function extractCategory(category: string): string {
  const colonIndex = category.indexOf(':');
  if (colonIndex >= 0) {
    return category.substring(colonIndex + 1).trim();
  }
  return category.trim();
}

/**
 * Check if description contains Stapelplätze and extract count
 * Example: "(100 Stapelplätze)" -> 100
 */
function extractStapelplaetzeCount(description: string): number | null {
  const match = description.match(/\((\d+)\s+Stapelplätze\)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Parse seating data from a raw string (file contents)
 * @param content Raw file contents as string
 * @returns Array of parsed seat information
 */
export function parseSeating(content: string): SeatInfo[] {
  // Clean content: remove null bytes and normalize line endings
  const cleanedContent = content
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n');

  const parseResult = Papa.parse<string[]>(cleanedContent, {
    header: false,
    skipEmptyLines: true,
    transform: (value: string) => value.trim(),
    transformHeader: (header: string) => header.trim(),
    quoteChar: '"',
    escapeChar: '"',
  });

  const records = parseResult.data;

  const seats: SeatInfo[] = [];

  for (const record of records) {
    // Skip records that don't have at least 3 fields (description, category, status)
    if (!Array.isArray(record) || record.length < 3) {
      continue;
    }

    const description = (record[0] || '').replace(/"/g, '').trim();
    const categoryField = (record[1] || '').trim();
    const status = (record[2] || '').trim();

    // Skip if essential fields are empty
    if (!description || !categoryField || !status) {
      continue;
    }

    // Handle special case: Stapelplätze
    const stapelplaetzeCount = extractStapelplaetzeCount(description);
    if (stapelplaetzeCount !== null) {
      const category = extractCategory(categoryField);
      
      for (let i = 0; i < stapelplaetzeCount; i++) {
        seats.push({
          area: undefined,
          row: undefined,
          seat: undefined,
          category,
          status,
        });
      }
      continue;
    }

    // Normal parsing
    const { area, row, seat } = parseDescription(description);
    const category = extractCategory(categoryField);

    seats.push({
      area,
      row,
      seat,
      category,
      status,
    });
  }

  return seats;
}



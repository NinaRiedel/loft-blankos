import { join } from 'path';
import { mkdirSync } from 'fs';
import { loadConfig, getOutputFolderName } from './utils.js';
import { generateIds } from './generateIds.js';
import { exportToCsv } from './exportCsv.js';
import { parseSeatingFile } from './parseSeating.js';
import { TicketData } from './types.js';

function formatSeatInfo(seatInfo: { area?: string; row?: string; seat?: string }): string | undefined {
  const parts: string[] = [];
  if (seatInfo.area) parts.push(seatInfo.area);
  if (seatInfo.row) parts.push(`Reihe ${seatInfo.row}`);
  if (seatInfo.seat) parts.push(`Platz ${seatInfo.seat}`);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

async function main() {
  try {
    // Load configuration
    const configPath = join(process.cwd(), 'config', 'ticket-config.json');
    const config = loadConfig(configPath);
    console.log(`Loaded config for: ${config.event.artist} - ${config.event.date}`);

    // Create output folder structure
    const outputFolderName = getOutputFolderName(config.event.artist, config.event.date);
    const outputBaseDir = join(process.cwd(), 'output', outputFolderName);
    mkdirSync(outputBaseDir, { recursive: true });
    console.log(`Output directory: ${outputBaseDir}`);

    // Parse seating file
    console.log(`Parsing seating file: ${config.seatingFile}`);
    const seatingData = parseSeatingFile(config.seatingFile);
    console.log(`Found ${seatingData.length} seats in seating file`);

    // Generate IDs for each seat
    const ids = generateIds(seatingData.length);
    console.log(`Generated ${ids.length} IDs`);

    // Prepare ticket data from seating information
    const tickets: TicketData[] = ids.map((id, index) => {
      const seat = seatingData[index];
      
      return {
        id,
        artist: config.event.artist,
        date: config.event.date,
        startTime: config.event.startTime,
        venue: config.event.venue,
        category: seat.category || config.event.category,
        seat: formatSeatInfo(seat),
        staticText: config.staticText,
        area: seat.area,
        row: seat.row,
        seatNumber: seat.seat,
      };
    });

    // Export CSV
    const csvPath = join(outputBaseDir, 'ids.csv');
    console.log('Exporting CSV...');
    await exportToCsv(tickets, csvPath);
    console.log(`CSV exported to: ${csvPath}`);

    console.log('\n✅ ID generation and CSV export complete!');
    console.log(`Total tickets: ${tickets.length}`);
    console.log(`CSV file: ${csvPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();


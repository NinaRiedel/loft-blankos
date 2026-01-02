import { join } from 'path';
import { mkdirSync } from 'fs';
import { loadConfig, getOutputFolderName } from './utils.js';
import { generateIds } from './generateIds.js';
import { exportToCsv } from './exportCsv.js';
import { TicketData } from './types.js';

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

    // Generate IDs
    console.log(`Generating ${config.ticketCount} IDs...`);
    const ids = generateIds(config.ticketCount);
    console.log(`Generated ${ids.length} IDs`);

    // Prepare ticket data
    const tickets: TicketData[] = ids.map(id => ({
      id,
      artist: config.event.artist,
      date: config.event.date,
      startTime: config.event.startTime,
      venue: config.event.venue,
      category: config.event.category,
      seat: config.seatInfo.enabled ? config.seatInfo.template : undefined,
      staticText: config.staticText,
    }));

    // Export CSV
    const csvPath = join(outputBaseDir, 'ids.csv');
    console.log('Exporting CSV...');
    await exportToCsv(tickets, csvPath);
    console.log(`CSV exported to: ${csvPath}`);

    console.log('\n✅ ID generation and CSV export complete!');
    console.log(`Total tickets: ${config.ticketCount}`);
    console.log(`CSV file: ${csvPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();


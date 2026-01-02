import { join } from 'path';
import { existsSync } from 'fs';
import { importFromCsv } from './importCsv.js';
import { generateQRCodes } from './generateQRCodes.js';
import { createTicketPDFs } from './createTicketPDF.js';
import { loadConfig } from './utils.js';
import { TicketData } from './types.js';

async function main() {
  try {
    // Get CSV path from command line argument or use default
    const csvPath = process.argv[2];
    
    if (!csvPath) {
      console.error('Usage: tsx src/generatePdfs.ts <path-to-csv-file>');
      console.error('Example: tsx src/generatePdfs.ts output/Example_Artist_2024-12-25/ids.csv');
      process.exit(1);
    }

    if (!existsSync(csvPath)) {
      console.error(`Error: CSV file not found: ${csvPath}`);
      process.exit(1);
    }

    // Load config to get includeQrCode setting
    const configPath = join(process.cwd(), 'config', 'ticket-config.json');
    const config = loadConfig(configPath);

    console.log(`Reading CSV from: ${csvPath}`);

    // Import tickets from CSV
    const tickets: TicketData[] = importFromCsv(csvPath);
    console.log(`Loaded ${tickets.length} tickets from CSV`);

    if (tickets.length === 0) {
      console.error('Error: No tickets found in CSV file');
      process.exit(1);
    }

    // Extract IDs for QR code generation
    const ids = tickets.map(ticket => ticket.id);

    // Generate QR codes (always generate, even if not included in PDF)
    console.log('Generating QR codes...');
    const qrCodes = await generateQRCodes(ids);
    console.log(`Generated ${qrCodes.length} QR codes`);

    // Determine output directory (same directory as CSV, in tickets subfolder)
    const csvDir = join(csvPath, '..');
    const ticketsDir = join(csvDir, 'tickets');

    // Create PDFs
    console.log('Creating PDFs...');
    const pdfFiles = await createTicketPDFs(tickets, qrCodes, ticketsDir, config.includeQrCode);
    console.log(`Created ${pdfFiles.length} PDF file(s):`);
    pdfFiles.forEach(file => console.log(`  - ${file}`));

    console.log('\n✅ PDF generation complete!');
    console.log(`Total tickets: ${tickets.length}`);
    console.log(`Total PDFs: ${pdfFiles.length}`);
    console.log(`QR codes in PDFs: ${config.includeQrCode ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();


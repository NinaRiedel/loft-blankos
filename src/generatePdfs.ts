import { join } from 'path';
import { existsSync } from 'fs';
import { importFromCsv } from './importCsv.js';
import { generateQRCodes } from './generateQRCodes.js';
import { createTicketPDFs } from './createTicketPDF.js';
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

    // Generate QR codes
    console.log('Generating QR codes...');
    const qrCodes = await generateQRCodes(ids);
    console.log(`Generated ${qrCodes.length} QR codes`);

    // Determine output directory (same directory as CSV, in tickets subfolder)
    const csvDir = join(csvPath, '..');
    const ticketsDir = join(csvDir, 'tickets');

    // Create PDFs
    console.log('Creating PDFs...');
    const pdfFiles = await createTicketPDFs(tickets, qrCodes, ticketsDir);
    console.log(`Created ${pdfFiles.length} PDF file(s):`);
    pdfFiles.forEach(file => console.log(`  - ${file}`));

    console.log('\n✅ PDF generation complete!');
    console.log(`Total tickets: ${tickets.length}`);
    console.log(`Total PDFs: ${pdfFiles.length}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();


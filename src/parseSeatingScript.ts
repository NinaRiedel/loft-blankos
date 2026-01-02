import { parseSeatingFile } from './parseSeating.js';

async function main() {
  try {
    const filePath = process.argv[2];

    if (!filePath) {
      console.error('Usage: tsx src/parseSeatingScript.ts <seating-file-path>');
      console.error('Example: tsx src/parseSeatingScript.ts ohne_export.txt');
      process.exit(1);
    }

    console.log(`Parsing seating file: ${filePath}`);
    const seats = parseSeatingFile(filePath);

    console.log(`\nFound ${seats.length} seats:\n`);
    
    seats.forEach((seat, index) => {
      console.log(`Seat ${index + 1}:`);
      if (seat.area) console.log(`  Area: ${seat.area}`);
      if (seat.row) console.log(`  Row: ${seat.row}`);
      if (seat.seat) console.log(`  Seat: ${seat.seat}`);
      console.log(`  Category: ${seat.category}`);
      console.log(`  Status: ${seat.status}`);
      console.log('');
    });

    console.log(`\n✅ Parsed ${seats.length} seats successfully!`);
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

main();


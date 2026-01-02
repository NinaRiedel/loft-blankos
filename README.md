# QR Ticket Generator

Generate concert tickets with QR codes in A7 format PDFs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your event in `config/ticket-config.json`:
   - Set ticket count
   - Update event details (artist, date, startTime, venue, category)
   - Configure seat info (optional)
   - Set static text

## Usage

### Full Process (Generate IDs + CSV + PDFs)
Run the complete generator:
```bash
npm start
```

Or using tsx directly:
```bash
tsx src/index.ts
```

### Separate Steps

#### Step 1: Generate IDs and Export CSV
Generate ticket IDs and export them to CSV:
```bash
npm run generate-ids
```

Or using tsx directly:
```bash
tsx src/generateIdsAndCsv.ts
```

This creates `output/{ArtistName}_{Date}/ids.csv`

#### Step 2: Generate PDFs from CSV
Generate PDFs from an existing CSV file:
```bash
npm run generate-pdfs
```

Or using tsx directly (with CSV path argument):
```bash
tsx src/generatePdfs.ts output/Example_Artist_2024-12-25/ids.csv
```

This reads the CSV and generates PDFs in `output/{ArtistName}_{Date}/tickets/`

## Output

Tickets are generated in `output/{ArtistName}_{Date}/`:
- `ids.csv` - CSV file with all ticket IDs and event information
- `tickets/tickets-001.pdf` - PDF files (max 20 tickets per PDF)

## Configuration

Edit `config/ticket-config.json` to customize:
- Number of tickets to generate
- Event information
- Seat information template (if enabled)
- Static text displayed on tickets

## Requirements

- Node.js 14.17+ (for `crypto.randomUUID()`)
- TypeScript 5.3+


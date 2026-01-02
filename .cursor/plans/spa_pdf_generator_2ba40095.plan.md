---
name: SPA PDF Generator
overview: Refactor the existing Node.js scripts into a browser-based single page app using React, with browser-compatible PDF generation, QR codes, and file downloads.
todos:
  - id: browser-lib
    content: Create browser-compatible lib modules (QR, PDF, CSV, download utils)
    status: pending
  - id: react-form
    content: Build TicketConfigForm component with all event fields
    status: pending
  - id: file-upload
    content: Build FileUpload component with drag-drop and parsing
    status: pending
  - id: generation-logic
    content: Wire up Generate button to create tickets, QRs, PDFs, CSV
    status: pending
  - id: download-section
    content: Build download section with individual PDF and CSV download buttons
    status: pending
---

# QR Ticket Generator SPA Conversion

## Architecture Overview

```mermaid
flowchart TD
    subgraph ui [React UI]
        Form[TicketConfigForm]
        Upload[FileUpload]
        Preview[TicketPreview]
        Downloads[DownloadSection]
    end
    
    subgraph logic [Browser Logic]
        Parse[parseSeating]
        GenIds[generateIds]
        GenQR[generateQRCodes]
        GenPDF[createTicketPDF]
        GenCSV[exportCsv]
    end
    
    Form --> State
    Upload --> Parse
    Parse --> State
    State --> Preview
    State --> GenIds
    GenIds --> GenQR
    GenQR --> GenPDF
    State --> GenCSV
    GenPDF --> Downloads
    GenCSV --> Downloads
```



## Key Refactoring

The existing logic in `src/` uses Node.js APIs (fs, streams). We'll create browser-compatible versions:| Current File | Change Required ||--------------|-----------------|| [`parseSeating.ts`](src/parseSeating.ts) | Keep `parseSeating(content: string)` as-is, remove fs-dependent `parseSeatingFile()` || [`generateIds.ts`](src/generateIds.ts) | Works as-is (`crypto.randomUUID()` is browser-compatible) || [`generateQRCodes.ts`](src/generateQRCodes.ts) | Use `QRCode.toDataURL()` instead of `toBuffer()` || [`createTicketPDF.ts`](src/createTicketPDF.ts) | Rewrite using `pdf-lib` (browser-compatible) instead of `pdfkit` || [`exportCsv.ts`](src/exportCsv.ts) | Generate CSV string manually, return as blob |

## Implementation Steps

### 1. Create browser-compatible core modules

Create new files in `src/lib/` for browser logic:

- `src/lib/generateQRCodes.ts` - QR generation returning data URLs
- `src/lib/createTicketPDF.ts` - PDF generation using pdf-lib, returning Uint8Array blobs
- `src/lib/exportCsv.ts` - CSV string generation
- `src/lib/downloadUtils.ts` - Utilities for triggering blob downloads

### 2. Build the React UI

Single page with these sections:

- **Event Config Form**: Artist, date, time, venue, category, staticText, includeQrCode toggle
- **File Upload**: Drag-drop or click to upload seating .txt file
- **Preview**: Show parsed ticket count and sample data
- **Generate Button**: Triggers ID, QR, and PDF generation
- **Downloads**: Individual PDF download buttons + CSV download button

### 3. State Management

Use React `useState` for simplicity:

- `config`: Event configuration from form
- `seatingData`: Parsed seat info from uploaded file
- `tickets`: Generated ticket data with UUIDs
- `qrCodes`: Generated QR code data URLs
- `pdfBlobs`: Generated PDF blobs (array)
- `csvBlob`: Generated CSV blob
- `isGenerating`: Loading state

### 4. Dependencies to Add
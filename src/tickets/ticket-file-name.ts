function slugifyArtistName(artistName: string): string {
    const normalizedName = artistName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return normalizedName || 'tickets';
}

function formatDateForFileName(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${month}-${day}-${year}`;
}

function fileStem(artistName: string, eventDate: string): string {
    const slug = slugifyArtistName(artistName);
    return eventDate
        ? `${slug}-${formatDateForFileName(eventDate)}`
        : slug;
}

export function getTicketPdfFileName(
    artistName: string,
    eventDate: string,
    fileIndex: number,
): string {
    return `tickets-${fileStem(artistName, eventDate)}-${fileIndex + 1}.pdf`;
}

export function getTicketZipFileName(
    artistName: string,
    eventDate: string,
): string {
    return `tickets-${fileStem(artistName, eventDate)}.zip`;
}

export function getTicketCsvFileName(
    artistName: string,
    eventDate: string,
): string {
    return `barcodes-${fileStem(artistName, eventDate)}.csv`;
}

export function getPreviewPdfFileName(
    artistName: string,
    eventDate: string,
): string {
    return `musterticket-${fileStem(artistName, eventDate)}.pdf`;
}

export function getDigitalExportPdfFileName(
    artistName: string,
    eventDate: string,
): string {
    return `digital-${fileStem(artistName, eventDate)}.pdf`;
}

export function getDigitalExportZipFileName(
    artistName: string,
    eventDate: string,
): string {
    return `digital-${fileStem(artistName, eventDate)}.zip`;
}

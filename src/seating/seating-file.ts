import * as z from 'zod';

const seatingFileNameSchema = z
    .string()
    .trim()
    .refine(fileName => fileName.toLowerCase().endsWith('.txt'), {
        error: 'Please upload a .txt file',
    });

const seatingContentHints = ['Reihe', 'Platz', 'Sitzplatz', 'Stapelplätze'];

function looksLikeSeatingContent(content: string): boolean {
    return seatingContentHints.some(hint => content.includes(hint));
}

async function decodeFileWithEncoding(
    file: File,
    encoding: string,
): Promise<string> {
    const buffer = await file.arrayBuffer();
    return new TextDecoder(encoding).decode(buffer);
}

export async function readSeatingFile(file: File): Promise<string> {
    seatingFileNameSchema.parse(file.name);

    const utf16Content = await decodeFileWithEncoding(file, 'utf-16le');
    if (looksLikeSeatingContent(utf16Content)) {
        return utf16Content;
    }

    const utf8Content = await file.text();
    if (looksLikeSeatingContent(utf8Content)) {
        return utf8Content;
    }

    return decodeFileWithEncoding(file, 'latin1');
}

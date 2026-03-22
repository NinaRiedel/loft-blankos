import Papa from 'papaparse';
import * as z from 'zod';

const optionalTextSchema = z
    .string()
    .optional()
    .transform(value => {
        const normalizedValue = value?.trim();
        return normalizedValue ? normalizedValue : undefined;
    });

const seatingRecordSchema = z.object({
    description: z.string().trim().min(1),
    categoryField: z.string().trim().min(1),
    availability: z.string().trim().min(1),
});

export const seatInfoSchema = z.object({
    kind: z.literal('assigned'),
    area: optionalTextSchema,
    row: optionalTextSchema,
    seatNumber: optionalTextSchema,
    category: z.string().trim().min(1),
    availability: z.string().trim().min(1),
});

export type SeatInfo = z.output<typeof seatInfoSchema>;

function parseSeatDescription(
    description: string,
): Pick<SeatInfo, 'area' | 'row' | 'seatNumber'> {
    const trimmedDescription = description.trim();

    if (trimmedDescription.includes('Stapelplätze')) {
        return {
            area: undefined,
            row: undefined,
            seatNumber: undefined,
        };
    }

    const rowMatch = trimmedDescription.match(/Reihe\s+(\d+)/i);
    const seatMatch = trimmedDescription.match(/Platz\s+(\d+)/i);

    let area: string | undefined;

    if (rowMatch?.index !== undefined) {
        const areaSegment = trimmedDescription.slice(0, rowMatch.index);
        area = areaSegment.replace(/\s+/g, ' ').trim() || undefined;
    }

    return {
        area,
        row: rowMatch?.[1],
        seatNumber: seatMatch?.[1],
    };
}

function extractSeatCategory(categoryField: string): string {
    const [, categoryName = categoryField] = categoryField.split(':');
    return categoryName.trim();
}

function extractStandingRoomCount(description: string): number | null {
    const match = description.match(/\((\d+)\s+Stapelplätze\)/i);
    return match ? Number.parseInt(match[1], 10) : null;
}

function createSeatInfo(input: Omit<SeatInfo, 'kind'>): SeatInfo {
    return seatInfoSchema.parse({
        kind: 'assigned',
        ...input,
    });
}

export function parseSeatingText(content: string): SeatInfo[] {
    const normalizedContent = content
        .replaceAll('\0', '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

    const parseResult = Papa.parse<string[]>(normalizedContent, {
        header: false,
        skipEmptyLines: true,
        transform: value => value.trim(),
        quoteChar: '"',
        escapeChar: '"',
    });

    const seats: SeatInfo[] = [];

    for (const rawRecord of parseResult.data) {
        if (!Array.isArray(rawRecord) || rawRecord.length < 3) {
            continue;
        }

        const parsedRecord = seatingRecordSchema.safeParse({
            description: (rawRecord[0] ?? '').replace(/"/g, '').trim(),
            categoryField: rawRecord[1] ?? '',
            availability: rawRecord[2] ?? '',
        });

        if (!parsedRecord.success) {
            continue;
        }

        const {description, categoryField, availability} = parsedRecord.data;
        const category = extractSeatCategory(categoryField);
        const standingRoomCount = extractStandingRoomCount(description);

        if (standingRoomCount !== null) {
            seats.push(
                ...Array.from({length: standingRoomCount}, () =>
                    createSeatInfo({
                        area: undefined,
                        row: undefined,
                        seatNumber: undefined,
                        category,
                        availability,
                    }),
                ),
            );
            continue;
        }

        const parsedDescription = parseSeatDescription(description);
        seats.push(
            createSeatInfo({
                ...parsedDescription,
                category,
                availability,
            }),
        );
    }

    return seats;
}

export function formatSeatInfo(seatInfo: SeatInfo): string | undefined {
    const parts = [
        seatInfo.area,
        seatInfo.row ? `Reihe ${seatInfo.row}` : undefined,
        seatInfo.seatNumber ? `Platz ${seatInfo.seatNumber}` : undefined,
    ].filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(', ') : undefined;
}

import {describe, expect, it} from 'vitest';
import {parseSeatingText, type SeatInfo} from './seat-info.js';

describe('parseSeatingText', () => {
    const testCases: Array<{
        name: string;
        input: string;
        expected: SeatInfo[];
    }> = [
        {
            name: 'should parse a simple seating string',
            input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei","-","-"
" Tribüne K  Reihe 8   Platz 2","1:Sitzplatz","frei","-","-"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '2',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
            ],
        },
        {
            name: 'should handle different seat types',
            input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei","-","-"
"Innenraum Stehplatz  Reihe  Tisch  Platz (10 Stapelplätze)","2:Stehplatz Innenraum","frei","-","-"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
                ...Array.from({length: 10}, () => ({
                    kind: 'assigned' as const,
                    area: undefined,
                    row: undefined,
                    seatNumber: undefined,
                    category: 'Stehplatz Innenraum',
                    availability: 'frei',
                })),
            ],
        },
        {
            name: 'should handle empty lines',
            input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei","-","-"

" Tribüne K  Reihe 8   Platz 2","1:Sitzplatz","frei","-","-"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '2',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
            ],
        },
        {
            name: 'should handle missing fields gracefully',
            input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
            ],
        },
        {
            name: 'should handle empty string',
            input: '',
            expected: [],
        },
        {
            name: 'should handle string with only whitespace',
            input: '   \n\n  \r\n  ',
            expected: [],
        },
        {
            name: 'should parse different areas and rows',
            input: `" Tribüne K  Reihe 9   Platz 10","1:Sitzplatz","frei","-","-"
" Tribüne K  Reihe 10   Platz 1","1:Sitzplatz","frei","-","-"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '9',
                    seatNumber: '10',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '10',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
            ],
        },
        {
            name: 'should handle category without colon',
            input: `" Tribüne K  Reihe 8   Platz 1","Sitzplatz","frei","-","-"`,
            expected: [
                {
                    kind: 'assigned',
                    area: 'Tribüne K',
                    row: '8',
                    seatNumber: '1',
                    category: 'Sitzplatz',
                    availability: 'frei',
                },
            ],
        },
        {
            name: 'should handle 100 Stapelplätze and create 100 entries',
            input: `"Innenraum Stehplatz  Reihe  Tisch  Platz (100 Stapelplätze)","2:Stehplatz Innenraum","frei","-","-"`,
            expected: Array.from({length: 100}, () => ({
                kind: 'assigned' as const,
                area: undefined,
                row: undefined,
                seatNumber: undefined,
                category: 'Stehplatz Innenraum',
                availability: 'frei',
            })),
        },
    ];

    it.each(testCases)('$name', ({input, expected}) => {
        expect(parseSeatingText(input)).toEqual(expected);
    });
});

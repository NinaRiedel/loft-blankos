import { describe, it, expect } from 'vitest';
import { parseSeating } from './parseSeating.js';
import type { SeatInfo } from './types.js';

describe('parseSeating', () => {
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
          area: 'Tribüne K',
          row: '8',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
        },
        {
          area: 'Tribüne K',
          row: '8',
          seat: '2',
          category: 'Sitzplatz',
          status: 'frei',
        },
      ],
    },
    {
      name: 'should handle different seat types',
      input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei","-","-"
"Innenraum Stehplatz  Reihe  Tisch  Platz (10 Stapelplätze)","2:Stehplatz Innenraum","frei","-","-"`,
      expected: [
        {
          area: 'Tribüne K',
          row: '8',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
        },
        ...Array.from({ length: 10 }, () => ({
          area: undefined,
          row: undefined,
          seat: undefined,
          category: 'Stehplatz Innenraum',
          status: 'frei',
        })),
      ],
    },
    {
      name: 'should handle empty lines',
      input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei","-","-"

" Tribüne K  Reihe 8   Platz 2","1:Sitzplatz","frei","-","-"`,
      expected: [
        {
          area: 'Tribüne K',
          row: '8',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
        },
        {
          area: 'Tribüne K',
          row: '8',
          seat: '2',
          category: 'Sitzplatz',
          status: 'frei',
        },
      ],
    },
    {
      name: 'should handle missing fields gracefully',
      input: `" Tribüne K  Reihe 8   Platz 1","1:Sitzplatz","frei"`,
      expected: [
        {
          area: 'Tribüne K',
          row: '8',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
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
          area: 'Tribüne K',
          row: '9',
          seat: '10',
          category: 'Sitzplatz',
          status: 'frei',
        },
        {
          area: 'Tribüne K',
          row: '10',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
        },
      ],
    },
    {
      name: 'should handle category without colon',
      input: `" Tribüne K  Reihe 8   Platz 1","Sitzplatz","frei","-","-"`,
      expected: [
        {
          area: 'Tribüne K',
          row: '8',
          seat: '1',
          category: 'Sitzplatz',
          status: 'frei',
        },
      ],
    },
    {
      name: 'should handle 100 Stapelplätze and create 100 entries',
      input: `"Innenraum Stehplatz  Reihe  Tisch  Platz (100 Stapelplätze)","2:Stehplatz Innenraum","frei","-","-"`,
      expected: Array.from({ length: 100 }, () => ({
        area: undefined,
        row: undefined,
        seat: undefined,
        category: 'Stehplatz Innenraum',
        status: 'frei',
      })),
    },
  ];

  it.each(testCases)('$name', ({ input, expected }: { name: string; input: string; expected: SeatInfo[] }) => {
    const result = parseSeating(input);
    expect(result).toEqual(expected);
  });
});


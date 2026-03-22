import {formatSeatInfo} from '../seating/seat-info.js';
import type {Ticket} from './ticket.js';

const csvHeaders = [
    'ID',
    'Artist',
    'Date',
    'StartTime',
    'Venue',
    'Category',
    'Seat',
    'Area',
    'Row',
    'SeatNumber',
    'StaticText',
];

function escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
}

function toTicketCsvRow(ticket: Ticket): string[] {
    if (ticket.placement.kind === 'manual') {
        return [
            ticket.id,
            ticket.artist,
            ticket.date,
            ticket.startTime,
            ticket.venue,
            ticket.category,
            '',
            ticket.placement.line1 ?? '',
            '',
            '',
            ticket.staticText,
        ];
    }

    return [
        ticket.id,
        ticket.artist,
        ticket.date,
        ticket.startTime,
        ticket.venue,
        ticket.category,
        formatSeatInfo(ticket.placement) ?? '',
        ticket.placement.area ?? '',
        ticket.placement.row ?? '',
        ticket.placement.seatNumber ?? '',
        ticket.staticText,
    ];
}

export function renderTicketCsv(tickets: Ticket[]): string {
    const csvRows = [
        csvHeaders.map(escapeCsvValue).join(','),
        ...tickets.map(ticket =>
            toTicketCsvRow(ticket).map(escapeCsvValue).join(','),
        ),
    ];

    return csvRows.join('\n');
}

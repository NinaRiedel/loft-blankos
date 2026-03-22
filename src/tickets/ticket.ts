import * as z from 'zod';
import {formatSeatInfo} from '../seating/seat-info.js';
import {
    type TicketPlacement,
    ticketPlacementSchema,
} from '../seating/ticket-placement.js';
import {type TicketForm, ticketFormSchema} from './ticket-form.js';
import {createTicketIds} from './ticket-id.js';

export const ticketSchema = z.object({
    id: z.string().uuid(),
    artist: z.string().trim().min(1),
    date: z.string().trim().min(1),
    startTime: z.string().trim().min(1),
    venue: z.string().trim().min(1),
    category: z.string().trim(),
    staticText: z.string().trim().min(1),
    placement: ticketPlacementSchema,
});

export type Ticket = z.output<typeof ticketSchema>;

function formatDateDE(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
}

export function buildTickets(
    form: TicketForm,
    placements: TicketPlacement[],
): Ticket[] {
    const normalizedForm = ticketFormSchema.parse(form);
    const ids = createTicketIds(placements.length);

    return placements.map((placement, index) =>
        ticketSchema.parse({
            id: ids[index],
            artist: normalizedForm.event.artist,
            date: formatDateDE(normalizedForm.event.date),
            startTime: normalizedForm.event.startTime,
            venue: normalizedForm.event.venue,
            category:
                placement.kind === 'assigned'
                    ? placement.category
                    : normalizedForm.event.category,
            staticText: normalizedForm.staticText,
            placement,
        }),
    );
}

export function getTicketSeatLines(ticket: Ticket): string[] {
    if (ticket.placement.kind === 'manual') {
        return [ticket.placement.line1, ticket.placement.line2].filter(
            (line): line is string => Boolean(line),
        );
    }

    const lines: string[] = [];

    if (ticket.placement.area) {
        lines.push(ticket.placement.area);
    }

    const seatLineParts = [
        ticket.placement.row ? `Reihe ${ticket.placement.row}` : undefined,
        ticket.placement.seatNumber
            ? `Platz ${ticket.placement.seatNumber}`
            : undefined,
    ].filter((part): part is string => Boolean(part));

    if (seatLineParts.length > 0) {
        lines.push(seatLineParts.join(', '));
    }

    return lines;
}

export function getTicketSeatSummary(ticket: Ticket): string | undefined {
    if (ticket.placement.kind === 'manual') {
        return ticket.placement.line1 ?? ticket.placement.line2;
    }

    return formatSeatInfo(ticket.placement);
}

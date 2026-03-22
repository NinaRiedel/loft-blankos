import * as z from 'zod';
import {
    type ManualTicketPlacement,
    manualTicketPlacementSchema,
} from './manual-ticket-placement.js';
import {type SeatInfo, seatInfoSchema} from './seat-info.js';

export const ticketPlacementSchema = z.discriminatedUnion('kind', [
    seatInfoSchema,
    manualTicketPlacementSchema,
]);

export type TicketPlacement = z.output<typeof ticketPlacementSchema>;

export function isManualTicketPlacement(
    placement: TicketPlacement,
): placement is ManualTicketPlacement {
    return placement.kind === 'manual';
}

export function isAssignedSeatInfo(
    placement: TicketPlacement,
): placement is SeatInfo {
    return placement.kind === 'assigned';
}

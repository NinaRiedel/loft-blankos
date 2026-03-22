import * as z from 'zod';

const requiredTextSchema = (message: string) =>
    z.string().trim().min(1, {error: message});

export const ticketEventSchema = z.object({
    artist: requiredTextSchema('Artist is required'),
    date: requiredTextSchema('Datum is required'),
    startTime: requiredTextSchema('Startzeit is required'),
    venue: requiredTextSchema('Venue is required'),
    category: z.string().trim(),
});

export type TicketEvent = z.output<typeof ticketEventSchema>;

export const defaultTicketEvent: TicketEvent = {
    artist: '',
    date: '',
    startTime: '',
    venue: '',
    category: '',
};

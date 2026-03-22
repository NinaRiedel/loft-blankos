import * as z from 'zod';
import {defaultTicketEvent, ticketEventSchema} from './ticket-event.js';

const requiredTextSchema = (message: string) =>
    z.string().trim().min(1, {error: message});

const ticketFormFieldNames = [
    'artist',
    'date',
    'startTime',
    'venue',
    'staticText',
] as const;

const ticketFormFieldNameSet = new Set<TicketFormField>(ticketFormFieldNames);

export const ticketFormSchema = z.object({
    includeQrCode: z.boolean(),
    event: ticketEventSchema,
    staticText: requiredTextSchema('Statischer Text is required'),
});

export type TicketForm = z.output<typeof ticketFormSchema>;
export type TicketFormField = (typeof ticketFormFieldNames)[number];
export type TicketFormErrors = Partial<Record<TicketFormField, string>>;

export const defaultTicketForm: TicketForm = {
    includeQrCode: true,
    event: defaultTicketEvent,
    staticText: 'Der Weiterverkauf dieses Tickets ist untersagt.',
};

function toTicketFormField(
    path: Array<PropertyKey>,
): TicketFormField | undefined {
    const fieldName = path[path.length - 1];

    if (
        typeof fieldName === 'string' &&
        ticketFormFieldNameSet.has(fieldName as TicketFormField)
    ) {
        return fieldName as TicketFormField;
    }

    return undefined;
}

export function getTicketFormErrors(form: TicketForm): TicketFormErrors {
    const result = ticketFormSchema.safeParse(form);

    if (result.success) {
        return {};
    }

    const errors: TicketFormErrors = {};

    for (const issue of result.error.issues) {
        const fieldName = toTicketFormField(issue.path);
        if (fieldName && !errors[fieldName]) {
            errors[fieldName] = issue.message;
        }
    }

    return errors;
}

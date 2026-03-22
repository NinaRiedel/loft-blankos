import * as z from 'zod';

const optionalTextSchema = z
    .string()
    .trim()
    .transform(value => value || undefined)
    .optional();

export const manualSeatingFormSchema = z.object({
    ticketCount: z.number().int().min(1).max(1000),
    line1: z.string(),
    line2: z.string(),
});

export type ManualSeatingForm = z.output<typeof manualSeatingFormSchema>;

export const defaultManualSeatingForm: ManualSeatingForm = {
    ticketCount: 1,
    line1: '',
    line2: '',
};

export const manualTicketPlacementSchema = z.object({
    kind: z.literal('manual'),
    line1: optionalTextSchema,
    line2: optionalTextSchema,
});

export type ManualTicketPlacement = z.output<
    typeof manualTicketPlacementSchema
>;

export function createManualTicketPlacements(
    form: ManualSeatingForm,
): ManualTicketPlacement[] {
    const normalizedForm = manualSeatingFormSchema.parse(form);
    const placement = manualTicketPlacementSchema.parse({
        kind: 'manual',
        line1: normalizedForm.line1,
        line2: normalizedForm.line2,
    });

    return Array.from({length: normalizedForm.ticketCount}, () => ({
        ...placement,
    }));
}

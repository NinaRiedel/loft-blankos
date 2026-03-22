import QRCode from 'qrcode';
import * as z from 'zod';

export const ticketQrCodeSchema = z.object({
    id: z.string().uuid(),
    dataUrl: z.string().min(1),
});

export type TicketQrCode = z.output<typeof ticketQrCodeSchema>;

export async function generateTicketQrCodes(
    ticketIds: string[],
): Promise<TicketQrCode[]> {
    const qrCodes: TicketQrCode[] = [];

    for (const ticketId of ticketIds) {
        try {
            const dataUrl = await QRCode.toDataURL(ticketId, {
                type: 'image/png',
                width: 200,
                margin: 1,
            });

            qrCodes.push(
                ticketQrCodeSchema.parse({
                    id: ticketId,
                    dataUrl,
                }),
            );
        } catch (error) {
            throw new Error(
                `Failed to generate QR code for ID ${ticketId}: ${error}`,
            );
        }
    }

    return qrCodes;
}

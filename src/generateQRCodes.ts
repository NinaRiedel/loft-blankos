import QRCode from 'qrcode';
import { QRCodeData } from './types.js';

export async function generateQRCodes(ids: string[]): Promise<QRCodeData[]> {
  const qrCodes: QRCodeData[] = [];

  for (const id of ids) {
    try {
      const buffer = await QRCode.toBuffer(id, {
        type: 'png',
        width: 200,
        margin: 1,
      });
      qrCodes.push({ id, buffer });
    } catch (error) {
      throw new Error(`Failed to generate QR code for ID ${id}: ${error}`);
    }
  }

  return qrCodes;
}


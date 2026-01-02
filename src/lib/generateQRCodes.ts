import QRCode from 'qrcode';

export interface QRCodeData {
  id: string;
  dataUrl: string; // Data URL instead of Buffer for browser
}

export async function generateQRCodes(ids: string[]): Promise<QRCodeData[]> {
  const qrCodes: QRCodeData[] = [];

  for (const id of ids) {
    try {
      const dataUrl = await QRCode.toDataURL(id, {
        type: 'image/png',
        width: 200,
        margin: 1,
      });
      qrCodes.push({ id, dataUrl });
    } catch (error) {
      throw new Error(`Failed to generate QR code for ID ${id}: ${error}`);
    }
  }

  return qrCodes;
}


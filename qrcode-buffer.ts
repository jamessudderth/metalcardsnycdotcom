import QRCode from "qrcode";

export const generateQRCodeBuffer = async (data: string, options: { 
  color?: string; 
  backgroundColor?: string;
  margin?: number;
  width?: number;
} = {}): Promise<Buffer> => {
  const {
    color = "#000000",
    backgroundColor = "#ffffff",
    margin = 4,
    width = 300
  } = options;

  try {
    const buffer = await QRCode.toBuffer(data, {
      color: {
        dark: color,
        light: backgroundColor
      },
      margin,
      width,
      errorCorrectionLevel: 'H' // Highest error correction level
    });
    
    return buffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
};
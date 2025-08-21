import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Ensure QR code directory exists
const qrCodeDir = path.resolve("dist/public/qrcodes");
if (!fs.existsSync(qrCodeDir)) {
  fs.mkdirSync(qrCodeDir, { recursive: true });
}

export const generateQRCode = async (data: string, options: { 
  color?: string; 
  backgroundColor?: string;
  margin?: number;
  width?: number;
} = {}): Promise<string> => {
  const {
    color = "#000000",
    backgroundColor = "#ffffff",
    margin = 4,
    width = 300
  } = options;

  try {
    const filename = `${uuidv4()}.png`;
    const filePath = path.join(qrCodeDir, filename);
    
    await QRCode.toFile(filePath, data, {
      color: {
        dark: color,
        light: backgroundColor
      },
      margin,
      width,
      errorCorrectionLevel: 'H' // Highest error correction level
    });
    
    return `/qrcodes/${filename}`;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

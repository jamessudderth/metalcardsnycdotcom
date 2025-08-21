import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Ensure upload directory exists
const uploadDir = path.resolve("dist/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const profileUploadDir = path.join(uploadDir, "profiles");
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const logoUploadDir = path.join(uploadDir, "logos");
if (!fs.existsSync(logoUploadDir)) {
  fs.mkdirSync(logoUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldname = file.fieldname;
    console.log('Upload fieldname:', fieldname);
    if (fieldname === "profileImage") {
      cb(null, profileUploadDir);
    } else if (fieldname === "logoImage" || fieldname === "bannerLogoImage") {
      cb(null, logoUploadDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${ext}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and SVG files are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const processImage = async (filePath: string, options: { width?: number; height?: number; quality?: number }) => {
  const { width, height, quality = 80 } = options;
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip SVG files as sharp doesn't need to process vector graphics
  if (ext === ".svg") {
    return filePath;
  }
  
  try {
    const processedFilePath = filePath.replace(ext, `_processed${ext}`);
    
    let processor = sharp(filePath);
    
    if (width || height) {
      processor = processor.resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    
    // Apply quality compression for JPG files
    if (ext === ".jpg" || ext === ".jpeg") {
      processor = processor.jpeg({ quality });
    } else if (ext === ".png") {
      processor = processor.png({ quality: Math.floor(quality * 0.01 * 100) });
    }
    
    await processor.toFile(processedFilePath);
    
    // Remove the original file
    fs.unlinkSync(filePath);
    
    return processedFilePath.replace(path.resolve("dist/public"), "");
  } catch (error) {
    console.error("Error processing image:", error);
    return filePath.replace(path.resolve("dist/public"), "");
  }
};

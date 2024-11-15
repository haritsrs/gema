import sharp from "sharp";
import multer from "multer";
import { promisify } from "util";

// Configure multer for handling file uploads
const upload = multer().single("file");
const uploadMiddleware = promisify(upload);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Handle the uploaded file
      await uploadMiddleware(req, res);
      const heicBuffer = req.file.buffer;

      // Convert HEIC/HEIF to JPEG
      const jpegBuffer = await sharp(heicBuffer).toFormat("jpeg").toBuffer();

      res.setHeader("Content-Type", "image/jpeg");
      res.status(200).send(jpegBuffer);
    } catch (error) {
      console.error("Error converting image:", error);
      res.status(500).send("Failed to convert the image.");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}


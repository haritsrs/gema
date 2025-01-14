import sharp from "sharp";
import multer from "multer";
import { promisify } from "util";

const upload = multer().single("file");
const uploadMiddleware = promisify(upload);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await uploadMiddleware(req, res);
      const heicBuffer = req.file.buffer;

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


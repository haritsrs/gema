// gema/src/app/api/sharp/route.js

import sharp from 'sharp';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const buffer = Buffer.from(await file.arrayBuffer());

    // Use Sharp to compress and resize image
    const optimizedImage = await sharp(buffer)
      .resize({ width: 800 }) // Set max width for compression
      .jpeg({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    return new NextResponse(optimizedImage, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error) {
    console.error("Sharp API Error:", error);
    return new NextResponse("Image processing failed", { status: 500 });
  }
}

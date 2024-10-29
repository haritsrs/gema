// import statement
import sharp from 'sharp';
import { NextResponse } from 'next/server';

// fungsi untuk menggunakan API sharp
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    // Mengambil buffer dari file yang diunggah
    const buffer = Buffer.from(await file.arrayBuffer());

    // Mengoptimalkan gambar menggunakan sharp
    const optimizedImage = await sharp(buffer)
      .resize({ width: 800 }) // Mengubah ukuran gambar menjadi 800px lebar
      .jpeg({ quality: 80 }) // Mengubah gambar menjadi format JPEG dengan kualitas 80%
      .toBuffer();

    // Mengembalikan gambar yang telah dioptimalkan
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

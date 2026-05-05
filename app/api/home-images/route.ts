import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomeImage from '@/models/HomeImage';
import { protect } from '@/lib/auth';

// GET all home images
export async function GET() {
  await connectToDatabase();
  try {
    const images = await HomeImage.find({});
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST new home image (protected)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const { image } = await req.json();
    const homeImage = await HomeImage.create({ image });
    return NextResponse.json(homeImage, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

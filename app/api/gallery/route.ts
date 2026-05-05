import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { protect } from '@/lib/auth';

// GET all gallery images
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    
    let query = Gallery.find({}).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const images = await query;
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST new gallery image (protected)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const { image, title } = await req.json();
    const gallery = await Gallery.create({ image, title });
    return NextResponse.json(gallery, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

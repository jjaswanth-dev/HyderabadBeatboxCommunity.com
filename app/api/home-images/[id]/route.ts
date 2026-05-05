import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomeImage from '@/models/HomeImage';
import { protect } from '@/lib/auth';

// DELETE home image
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    await HomeImage.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Image removed' });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

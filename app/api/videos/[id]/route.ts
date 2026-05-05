import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';
import { protect } from '@/lib/auth';

// DELETE video
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    await Video.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Video removed' });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

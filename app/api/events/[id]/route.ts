import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';
import { protect } from '@/lib/auth';

// PUT update event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    const body = await req.json();
    const event = await Event.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(event);
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// DELETE event
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Event removed' });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

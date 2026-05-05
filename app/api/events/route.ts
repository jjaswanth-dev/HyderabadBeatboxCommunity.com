import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';
import { protect } from '@/lib/auth';

// GET all events
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    
    let query = Event.find();
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const events = await query;
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch events', error: error.message }, { status: 500 });
  }
}

// POST new event (protected)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const body = await req.json();
    const event = await Event.create(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

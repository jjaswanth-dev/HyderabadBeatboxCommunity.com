import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ticket, { DEFAULT_TICKET_CONFIG } from '@/models/Ticket';
import { protect } from '@/lib/auth';

export async function GET() {
  await connectToDatabase();
  try {
    let ticket = await Ticket.findOne({});
    if (!ticket) {
      ticket = await Ticket.create(DEFAULT_TICKET_CONFIG);
    }
    return NextResponse.json(ticket, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch ticket configurations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const body = await req.json();

    let ticket = await Ticket.findOne({});
    if (ticket) {
      if (body.isActive !== undefined) ticket.isActive = body.isActive;
      if (body.formUrl !== undefined) ticket.formUrl = body.formUrl;
      if (body.title !== undefined) ticket.title = body.title;
      if (body.eventTag !== undefined) ticket.eventTag = body.eventTag;
      if (body.admitText !== undefined) ticket.admitText = body.admitText;
      if (body.serialNumber !== undefined) ticket.serialNumber = body.serialNumber;
      if (body.priceText !== undefined) ticket.priceText = body.priceText;
      await ticket.save();
    } else {
      ticket = await Ticket.create({
        ...DEFAULT_TICKET_CONFIG,
        ...body,
      });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error: any) {
    if (error.message && error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message || 'Failed to update ticket settings' }, { status: 400 });
  }
}

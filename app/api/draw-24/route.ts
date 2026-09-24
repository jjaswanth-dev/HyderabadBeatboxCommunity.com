import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Draw24, { DEFAULT_25_BEATBOXERS } from '@/models/Draw24';
import { protect } from '@/lib/auth';

export async function GET() {
  await connectToDatabase();
  try {
    let draw24 = await Draw24.findOne({});
    if (!draw24) {
      draw24 = {
        isActive: true,
        title: 'Hyderabad Beatbox Championship 2026',
        registrationFee: '₹350',
        googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSengmcfx01WNUSI_ECZhjAkPEwlhn-i-au-cczkLme5yH9qtg/viewform',
        instagramHandle: '@hydbeatboxcommunity',
        beatboxers: DEFAULT_25_BEATBOXERS,
      };
    }
    return NextResponse.json(draw24, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const body = await req.json();

    let draw24 = await Draw24.findOne({});
    if (draw24) {
      draw24.isActive = body.isActive !== undefined ? body.isActive : draw24.isActive;
      draw24.title = body.title || draw24.title;
      draw24.registrationFee = body.registrationFee || draw24.registrationFee;
      draw24.googleFormUrl = body.googleFormUrl || draw24.googleFormUrl;
      draw24.instagramHandle = body.instagramHandle || draw24.instagramHandle;
      if (Array.isArray(body.beatboxers)) {
        draw24.beatboxers = body.beatboxers;
      }
      await draw24.save();
    } else {
      draw24 = await Draw24.create(body);
    }

    return NextResponse.json(draw24, { status: 200 });
  } catch (error: any) {
    if (error.message && error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message || 'Failed to update Draw 24 settings' }, { status: 400 });
  }
}

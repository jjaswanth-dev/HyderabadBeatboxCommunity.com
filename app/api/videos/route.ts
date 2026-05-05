import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';
import { protect } from '@/lib/auth';

// Helper function to get YouTube video ID
const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// GET all videos
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    
    let query = Video.find({}).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const videos = await query;
    return NextResponse.json(videos);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST new video (protected)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const { url, title } = await req.json();
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json({ message: 'Invalid YouTube URL' }, { status: 400 });
    }

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    const video = await Video.create({
      url: embedUrl,
      title,
      thumbnail
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

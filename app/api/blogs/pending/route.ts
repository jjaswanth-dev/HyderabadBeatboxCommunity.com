import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { protect } from '@/lib/auth';

// GET pending blogs (protected)
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const pendingBlogs = await Blog.find({ status: 'pending' }).sort({ createdAt: -1 });
    return NextResponse.json(pendingBlogs);
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

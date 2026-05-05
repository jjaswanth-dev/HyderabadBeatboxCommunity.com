import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { protect } from '@/lib/auth';

// GET approved blogs (public)
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    
    let query = Blog.find({ status: 'approved' }).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const blogs = await query;
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST new blog (public - goes to pending)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    const { title, content, image, author } = await req.json();
    const newBlog = new Blog({ title, content, image, author });
    const savedBlog = await newBlog.save();
    return NextResponse.json(savedBlog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

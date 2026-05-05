import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { protect } from '@/lib/auth';

// GET single blog by ID (public)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    const blog = await Blog.findById(id);
    if (blog) {
      return NextResponse.json(blog);
    }
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE blog (protected)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    const blog = await Blog.findById(id);
    if (blog) {
      await blog.deleteOne();
      return NextResponse.json({ message: 'Blog removed' });
    }
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

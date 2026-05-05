import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { protect } from '@/lib/auth';

// PUT - approve a blog
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    await protect(req);
    const { id } = await params;
    const blog = await Blog.findById(id);
    if (blog) {
      blog.status = 'approved';
      const updatedBlog = await blog.save();
      return NextResponse.json(updatedBlog);
    }
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

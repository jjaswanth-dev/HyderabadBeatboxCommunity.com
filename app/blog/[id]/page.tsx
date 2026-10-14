import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogDetail from "@/components/BlogDetail";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { stripFormatting } from '@/lib/blogUtils';

interface Params {
  id: string;
}

// Generate dynamic metadata for SEO and social platform previews (e.g. WhatsApp, Twitter/X)
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  await connectToDatabase();
  try {
    const blog = await Blog.findById(resolvedParams.id);
    if (!blog || blog.status !== 'approved') {
      return {
        title: "Blog Post - Hyderabad Beatbox Community",
      };
    }

    const title = `${blog.title} | Hyderabad Beatbox Community`;
    const description = stripFormatting(blog.content, 150);
    
    const imageUrl = blog.image.startsWith("data:image") ? "" : blog.image;

    return {
      title,
      description,
      openGraph: {
        title: blog.title,
        description,
        type: "article",
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post - Hyderabad Beatbox Community",
    };
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  let blog = null;
  try {
    const foundBlog = await Blog.findOne({ _id: resolvedParams.id, status: 'approved' });
    if (foundBlog) {
      blog = JSON.parse(JSON.stringify(foundBlog));
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <BlogDetail initialBlog={blog} />
    </div>
  );
}

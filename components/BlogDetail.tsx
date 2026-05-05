"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useParams } from "next/navigation";
import Section from "./Section";
import LoadingSpinner from "./LoadingSpinner";

interface BlogType {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
}

export default function BlogDetail() {
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        const data = await res.json();
        setBlog(data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
      setLoading(false);
    };

    if (id) fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Section className="py-16 md:py-32">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Section>
    );
  }

  if (!blog) {
    return (
      <Section className="py-16 md:py-32">
        <h2 className="text-2xl text-center text-white/80">
          Blog post not found.
        </h2>
      </Section>
    );
  }

  return (
    <Section className="py-2 md:py-4">
      <div className="container mx-auto px-4 md:px-10">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <img
          src={
            blog.image.startsWith("data:image")
              ? blog.image
              : `${blog.image}?tr=w-1200,q-80`
          }
          alt={blog.title}
          className="h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg mx-auto"
        />

        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center gradient-text">
          {blog.title}
        </h1>
        <p className="text-center text-white/60 mb-8">
          By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}
        </p>

        <div className="prose prose-sm md:prose-lg prose-invert max-w-none text-white/80 mx-auto">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </div>
    </Section>
  );
}

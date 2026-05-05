"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function Blog({ initialLimit = 0 }: { initialLimit?: number }) {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchBlogs = async (limit: number | null = null) => {
    try {
      if (limit) setLoading(true);
      const queryLimit = limit ? limit + 1 : null;
      const url = queryLimit
        ? `/api/blogs?limit=${queryLimit}`
        : `/api/blogs`;
      const res = await fetch(url);
      const data = await res.json();

      if (limit && data.length > limit) {
        setBlogs(data.slice(0, limit));
        setHasMore(true);
      } else {
        setBlogs(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs(initialLimit || null);
  }, [initialLimit]);

  if (loading) {
    return (
      <Section id="blog" className="py-16 md:py-32">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-16 text-center gradient-text">
          Blog
        </h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Section>
    );
  }

  return (
    <Section id="blog" className="py-16 md:py-32">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-16 text-center gradient-text">
          From the Community: Latest Blog Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              href={`/blog/${blog._id}`}
              key={blog._id}
              className="bg-[#111] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={
                  blog.image.startsWith("data:image")
                    ? blog.image
                    : `${blog.image}?tr=w-400,q-80`
                }
                alt={blog.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">
                  {blog.title}
                </h3>
                <p className="text-white/60 mb-4">By {blog.author}</p>
                <p className="text-white/80">
                  {blog.content.substring(0, 100)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 space-x-4">
          {initialLimit > 0 && hasMore && (
            <Link
              href="/blog"
              className="inline-block px-8 py-4 bg-white/10 border border-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors duration-300"
            >
              View all Blogs
            </Link>
          )}
          <Link
            href="/write-blog"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-300"
          >
            Write a Blog Post
          </Link>
        </div>
      </div>
    </Section>
  );
}

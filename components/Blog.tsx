"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Section from "./Section";
import LoadingSpinner from "./LoadingSpinner";
import Image from "next/image";
import { stripFormatting } from "@/lib/blogUtils";

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
              className="bg-[#111] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-row md:flex-col items-stretch border border-white/5 hover:border-white/10"
            >
              <div className="relative w-28 sm:w-36 md:w-full min-h-[112px] sm:min-h-[144px] md:min-h-0 h-auto md:h-56 overflow-hidden flex-shrink-0">
                <Image
                  src={
                    blog.image.startsWith("data:image")
                      ? blog.image
                      : blog.image // next/image handles the optimization if configured correctly, but we can also pass a custom loader if needed.
                  }
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 150px, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 md:mb-2 text-white line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-white/60 text-[10px] sm:text-xs md:text-sm mb-1.5 md:mb-3">By {blog.author}</p>
                <p className="text-white/80 text-xs md:text-sm line-clamp-2 md:line-clamp-3">
                  {stripFormatting(blog.content, 90)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 md:mt-12">
          {initialLimit > 0 && hasMore && (
            <Link
              href="/blog"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3.5 bg-white/10 border border-white/15 hover:border-white/30 text-white rounded-full font-bold text-xs sm:text-sm hover:bg-white/20 transition-all duration-300 text-center"
            >
              View all Blogs
            </Link>
          )}
          <Link
            href="/write-blog"
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 text-center"
          >
            Write a Blog Post
          </Link>
        </div>
      </div>
    </Section>
  );
}

"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useParams } from "next/navigation";
import Section from "./Section";
import LoadingSpinner from "./LoadingSpinner";
import { Share2, Check, Copy, MessageSquare } from "lucide-react";

interface BlogType {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
}

export default function BlogDetail({ initialBlog }: { initialBlog: BlogType }) {
  const [blog, setBlog] = useState<BlogType>(initialBlog);
  const [loading, setLoading] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past the static header (around 450px)
      setIsSticky(window.scrollY > 450);

      // Update reading progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: blog.title,
          text: `Check out this blog post: ${blog.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

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
    <>
      {/* Sticky Header (shows only when scrolled past the static header, fixed full-width black top bar) */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform ${
          isSticky 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-black/95 backdrop-blur-md border-b border-white/10 py-3 px-4 md:px-8 relative shadow-xl">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img
                src={
                  blog.image.startsWith("data:image")
                    ? blog.image
                    : `${blog.image}?tr=w-100,h-100,fo-auto,q-80`
                }
                alt={blog.title}
                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg border border-white/10 flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-white font-bold truncate text-sm md:text-base tracking-tight">
                  {blog.title}
                </h4>
                <p className="text-white/60 text-xs truncate">
                  By {blog.author}
                </p>
              </div>
            </div>

            <Link
              href="/#blog"
              className="text-xs md:text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 flex-shrink-0 flex items-center gap-1.5"
            >
              &larr; <span className="hidden sm:inline">Back to</span> Home
            </Link>
          </div>

          {/* Reading Progress Bar */}
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-neutral-500 transition-all duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      <Section className="py-2 md:py-4">
      <div className="container mx-auto px-4 md:px-10 relative">
        <div className="mb-8">
          <Link href="/#blog" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        {/* 1. Static inline header (scrolls naturally out of view) */}
        <div className="mb-12">
          <img
            src={
              blog.image.startsWith("data:image")
                ? blog.image
                : `${blog.image}?tr=w-1200,q-80`
            }
            alt={blog.title}
            className="h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg mx-auto w-full"
          />

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center gradient-text">
            {blog.title}
          </h1>
          <p className="text-center text-white/60 mb-8">
            By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-sm sm:prose-base md:prose-lg prose-invert max-w-none text-white/80 mx-auto">
          <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]}>{blog.content}</ReactMarkdown>
        </div>

        {/* Share Section */}
        <div className="mt-16 border-t border-white/10 pt-8 max-w-none prose prose-invert mx-auto">
          <h3 className="text-xl font-bold mb-4 text-white">Share this article</h3>
          <div className="flex flex-wrap items-center gap-4">
            {/* Native Share Button (only if supported) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-110 shadow-md cursor-pointer"
                title="Share via other apps"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* WhatsApp Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this blog post: *${blog.title}*\n\n${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#25D366]/20 hover:border-[#25D366] text-white hover:text-[#25D366] transition-all duration-300 hover:scale-110 shadow-md"
              title="Share on WhatsApp"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.885-6.974C16.526 1.909 14.058.882 11.433.882c-5.449 0-9.873 4.42-9.877 9.855-.001 1.748.458 3.454 1.328 4.962L1.87 21.03l5.09-1.332z" />
                <path d="M16.924 13.886c-.27-.135-1.595-.788-1.842-.878-.248-.09-.43-.135-.61.135-.18.27-.697.878-.853 1.058-.157.18-.314.202-.584.067-.27-.135-1.14-.42-2.172-1.34-.803-.717-1.345-1.603-1.502-1.873-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.473.135-.157.18-.27.27-.45.09-.18.045-.337-.022-.473-.068-.135-.61-1.467-.835-2.012-.22-.53-.44-.457-.61-.466-.157-.008-.337-.01-.518-.01a1.004 1.004 0 00-.727.338c-.248.27-.945.923-.945 2.25s.968 2.61 1.103 2.79c.135.18 1.906 2.91 4.618 4.08.645.278 1.148.445 1.54.57.648.206 1.24.177 1.706.108.52-.078 1.595-.653 1.82-1.283.226-.63.226-1.17.157-1.283-.067-.113-.248-.18-.518-.315z" fillRule="evenodd" />
              </svg>
            </a>

            {/* Twitter/X Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Read this awesome beatbox blog: ${blog.title}`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/35 text-white transition-all duration-300 hover:scale-110 shadow-md"
              title="Share on X (Twitter)"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 shadow-md cursor-pointer ${
                copied 
                  ? "bg-green-500/10 border-green-500 text-green-400" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
              }`}
              title={copied ? "Link Copied!" : "Copy Link"}
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Section>
    </>
  );
}

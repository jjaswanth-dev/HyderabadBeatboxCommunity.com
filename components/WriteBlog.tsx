"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Section from "./Section";
import { upload } from "@imagekit/next";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit/auth");
    if (!response.ok) throw new Error("Authentication failed");
    return await response.json();
  } catch (error) {
    throw new Error(`Authentication error: ${error}`);
  }
};

export default function WriteBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB Size Limit
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("File is too large! Please upload an image smaller than 5MB.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Get Auth Params
      const authResponse = await fetch("/api/imagekit/auth");
      const { token, expire, signature, publicKey } = await authResponse.json();

      // 2. Upload to ImageKit
      const result = await upload({
        file,
        fileName: file.name,
        publicKey,
        token,
        expire,
        signature,
        folder: "hyd_site_blog_uimages",
      });

      setImage(result.url || "");
      setSuccess("Image uploaded successfully!");
    } catch (err: any) {
      setError("Image upload failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Title is required.");
      return;
    }
    if (!author) {
      setError("Author name is required.");
      return;
    }
    if (!content) {
      setError("Blog content is required.");
      return;
    }
    if (!image) {
      setError("Please upload a cover image for your blog.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, image, author }),
      });
      setSuccess("Blog post submitted! It will be reviewed by our admin team and published within 48 hours.");
      setTitle("");
      setContent("");
      setImage("");
      setAuthor("");
      setTimeout(() => router.push("/blog"), 2000);
    } catch (err) {
      setError("Failed to submit blog post. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section id="write-blog" className="py-16 md:py-32">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-16 text-center gradient-text">
          Write a Blog Post
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto glass-effect p-8 rounded-lg shadow-lg border border-white/10"
        >
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="mb-4">
            <label htmlFor="title" className="block text-white/80 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="author" className="block text-white/80 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-white/80 mb-2">
              Content
            </label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="image" className="block text-white/80 mb-2">
              Blog Cover Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {image && (
              <div className="mt-4">
                <p className="text-sm text-green-400 mb-2">Image ready!</p>
                <img src={image} alt="Preview" className="w-full h-40 object-cover rounded-md border border-white/20" />
              </div>
            )}
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
}

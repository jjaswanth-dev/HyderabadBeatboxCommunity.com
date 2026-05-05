"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "./Section";

export default function WriteBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !image || !author) {
      setError("All fields are required.");
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
      setSuccess("Blog post submitted for approval!");
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
              Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-white"
            />
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

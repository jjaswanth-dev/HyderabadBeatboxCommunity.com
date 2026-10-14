"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Section from "./Section";
import { upload } from "@imagekit/next";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Eye, 
  Edit2, 
  Upload, 
  Sparkles, 
  Check, 
  X,
  Code,
  Tv,
  Tag,
  Minus,
  Bot
} from "lucide-react";
import { normalizeContent } from "@/lib/blogUtils";

/**
 * Client-side image compression helper.
 * If an image file exceeds 1MB, compresses it down to <= 1MB using HTML5 Canvas.
 */
async function compressImageTo1MB(file: File): Promise<File> {
  const ONE_MB = 1024 * 1024;
  if (file.size <= ONE_MB) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale oversized dimensions (e.g. 4000px+ down to max 1920px)
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        const tryCompress = (q: number, currentWidth: number, currentHeight: number) => {
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.clearRect(0, 0, currentWidth, currentHeight);
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              // If under 1MB or quality has reached minimal threshold, return as File
              if (blob.size <= ONE_MB || q <= 0.45) {
                const newName = file.name.replace(/\.[^.]+$/, ".jpg");
                const compressedFile = new File([blob], newName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Try again with lower quality and slight downscaling
                tryCompress(q - 0.15, Math.round(currentWidth * 0.85), Math.round(currentHeight * 0.85));
              }
            },
            "image/jpeg",
            q
          );
        };

        tryCompress(0.85, width, height);
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function WriteBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);

  const docFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const insertText = (prefix: string, suffix: string = "", defaultText: string = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = prefix + (selectedText || defaultText) + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || defaultText).length
      );
    }, 0);
  };

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const isHtml = fileName.endsWith(".html") || fileName.endsWith(".htm");

    const reader = new FileReader();
    reader.onload = (event) => {
      let rawText = (event.target?.result as string) || "";
      if (!rawText) return;

      if (isHtml) {
        // If full HTML document, extract title if title input is empty
        const titleMatch = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1] && !title.trim()) {
          setTitle(titleMatch[1].trim());
        }

        // Extract any <style> tags from <head> so custom styling is retained
        const styleMatches = rawText.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
        const extractedStyles = styleMatches.join("\n\n");

        // If body tags exist, extract inner body content for cleaner blog insertion
        const bodyMatch = rawText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch && bodyMatch[1] ? bodyMatch[1].trim() : rawText.trim();

        if (extractedStyles && !bodyContent.includes("<style")) {
          bodyContent = `${extractedStyles}\n\n${bodyContent}`;
        }

        rawText = normalizeContent(bodyContent);
      } else {
        // If markdown starts with # Title, extract title if title input is empty
        const mdTitleMatch = rawText.match(/^#\s+(.+)$/m);
        if (mdTitleMatch && mdTitleMatch[1] && !title.trim()) {
          setTitle(mdTitleMatch[1].trim());
        }
        rawText = normalizeContent(rawText);
      }

      setContent(rawText);
      setLoadedFileName(fileName);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setLoading(true);
    setErrors({});
    setUploadStatus(null);

    try {
      const ONE_MB = 1024 * 1024;
      let fileToUpload = rawFile;

      // Auto-compress image to under 1MB if larger
      if (rawFile.size > ONE_MB) {
        setUploadStatus("Optimizing and compressing image to under 1MB...");
        fileToUpload = await compressImageTo1MB(rawFile);
      }

      if (fileToUpload.size > ONE_MB) {
        setErrors({ image: "Image is too large! Please upload an image smaller than 1MB." });
        setLoading(false);
        setUploadStatus(null);
        return;
      }

      setUploadStatus("Uploading image to ImageKit...");

      // 1. Get Auth Params
      const authResponse = await fetch("/api/imagekit/auth");
      const { token, expire, signature, publicKey } = await authResponse.json();

      // 2. Upload to ImageKit
      const result = await upload({
        file: fileToUpload,
        fileName: fileToUpload.name,
        publicKey,
        token,
        expire,
        signature,
        folder: "hyd_site_blog_uimages",
      });

      setImage(result.url || "");
    } catch (err: any) {
      setErrors({ image: "Image upload failed: " + err.message });
      console.error(err);
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title) newErrors.title = "Title is required.";
    if (!author) newErrors.author = "Author name is required.";
    if (!content) newErrors.content = "Blog content is required.";
    if (!image) newErrors.image = "Please upload a cover image for your blog.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: normalizeContent(content), image, author }),
      });
      setShowModal(true);
      setTitle("");
      setContent("");
      setImage("");
      setAuthor("");
      setLoadedFileName(null);
    } catch (err) {
      setErrors({ form: "Failed to submit blog post. Please try again." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section id="write-blog" className="py-8 md:py-12">
      {/* Hidden file input for Markdown/HTML doc import */}
      <input
        type="file"
        ref={docFileInputRef}
        accept=".md,.markdown,.html,.htm,.txt"
        onChange={handleDocFileUpload}
        className="hidden"
      />

      <div className="container mx-auto px-4 relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-center gradient-text">
          Write a Blog Post
        </h2>

        {/* Minimalist Black-and-White Note */}
        <div className="max-w-5xl mx-auto mb-8 bg-[#0d0d0d] border border-white/15 rounded-xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-sm md:text-base">
                  Markdown (.md) &amp; HTML (.html) Supported
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20">
                  .md
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20">
                  .html
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Upload your <strong className="text-white">.md</strong> or <strong className="text-white">.html</strong> file so that your blog looks nicely formatted with clean headings, styled text, and embeds.
              </p>
              <p className="text-xs text-white/60 pt-1 leading-relaxed border-t border-white/10 mt-2">
                <span className="text-white font-medium">AI Tip:</span> You can simply give your normal text to any AI (ChatGPT, Claude, Gemini) and tell it: <em className="text-white/90">&ldquo;Write/format this blog post in Markdown (.md) or HTML (.html) with stylish headings and bullet points&rdquo;</em>, then upload or paste the file here.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => docFileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
                title="Upload Markdown or HTML file"
              >
                <Upload className="w-4 h-4 text-black" />
                <span>Upload .md / .html File</span>
              </button>
            </div>
          </div>

          {/* Active File Loaded Confirmation */}
          {loadedFileName && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/90">
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white" />
                Loaded: <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white">{loadedFileName}</span>
              </span>
              <button
                type="button"
                onClick={() => setLoadedFileName(null)}
                className="text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto glass-effect p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10"
        >
          {errors.form && <p className="text-red-500 mb-4 text-center">{errors.form}</p>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Info & Image */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-white/90 mb-2 font-medium text-sm">
                  Blog Title
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g. Inside the Top 16 Championship Battles..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-3.5 bg-white/10 backdrop-blur-md text-white placeholder:text-gray-500 rounded-xl border ${
                    errors.title ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="author" className="block text-white/90 mb-2 font-medium text-sm">
                  Author / Beatboxer Name
                </label>
                <input
                  type="text"
                  id="author"
                  placeholder="e.g. Beatboxer Rexon / Community Member"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={`w-full p-3.5 bg-white/10 backdrop-blur-md text-white placeholder:text-gray-500 rounded-xl border ${
                    errors.author ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`}
                />
                {errors.author && <p className="text-red-500 text-xs mt-1.5">{errors.author}</p>}
              </div>

              <div>
                <label htmlFor="image" className="block text-white/90 mb-2 font-medium text-sm">
                  Blog Cover Image
                </label>
                <div
                  className={`p-4 rounded-xl border-2 border-dashed ${
                    errors.image ? "border-red-500 bg-red-500/5" : "border-white/20 bg-white/5"
                  } transition-all`}
                >
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-white text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-white/50 mt-2">
                    Max file size: <span className="text-white font-semibold">1MB</span> (Larger images are automatically compressed to 1MB)
                  </p>
                </div>
                {uploadStatus && <p className="text-white/80 text-xs mt-1.5 animate-pulse">{uploadStatus}</p>}
                {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}

                {image && (
                  <div className="mt-4 animate-in fade-in zoom-in duration-300">
                    <p className="text-xs text-green-400 mb-2 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Cover image ready (under 1MB)
                    </p>
                    <img
                      src={image}
                      alt="Cover Preview"
                      className="w-full h-44 object-cover rounded-xl border border-white/20 shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Editor & Preview */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/90 font-medium text-sm">
                  Blog Content <span className="text-white/50 font-normal">(Markdown & HTML)</span>
                </label>
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload .md / .html</span>
                </button>
              </div>

              <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 mb-3 gap-3">
                  {/* Tabs: Write and Preview */}
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "write"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "preview"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Live Preview
                    </button>
                  </div>

                  {/* Toolbar (Markdown + HTML Shortcuts) */}
                  {activeTab === "write" && (
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide py-1 px-1.5 max-w-full">
                      {/* Markdown Formatting */}
                      <button
                        type="button"
                        onClick={() => insertText("**", "**", "bold text")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Bold (**text**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("*", "*", "italic text")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Italic (*text*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-[1px] bg-white/10 mx-0.5 flex-shrink-0" />
                      <button
                        type="button"
                        onClick={() => insertText("# ", "", "Main Heading")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Heading 1"
                      >
                        <Heading1 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("## ", "", "Subheading")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Heading 2"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("### ", "", "Section Heading")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Heading 3"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-[1px] bg-white/10 mx-0.5 flex-shrink-0" />
                      <button
                        type="button"
                        onClick={() => insertText("- ", "", "List item")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("1. ", "", "First item")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("> ", "", "Quote message")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Quote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("[", "](url)", "link text")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Link"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-[1px] bg-white/10 mx-0.5 flex-shrink-0" />
                      {/* HTML Quick Inserts */}
                      <button
                        type="button"
                        onClick={() => insertText('<div style="background: rgba(37,99,235,0.1); border-left: 4px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 12px 0;">', '</div>', 'Your highlighted note here')}
                        className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Insert HTML Box (<div>)"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('<iframe width="100%" height="360" src="https://www.youtube.com/embed/', '" title="Video" frameborder="0" allowfullscreen style="border-radius: 12px; margin: 16px 0;"></iframe>', 'VIDEO_ID')}
                        className="p-1.5 text-amber-400 hover:text-white hover:bg-amber-600/30 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Insert YouTube iframe"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('<span style="background: #10b981; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">', '</span>', 'TAG')}
                        className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-600/30 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Insert HTML Badge (<span>)"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("\n\n---\n\n", "")}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title="Horizontal Divider"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                {activeTab === "write" ? (
                  <div className="flex flex-col flex-grow">
                    <textarea
                      ref={textareaRef}
                      id="content"
                      placeholder="Write your story in Markdown or HTML... (or click 'Upload .md / .html' to import a file)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`flex-grow w-full p-4 bg-white/10 backdrop-blur-md text-white placeholder:text-gray-500 rounded-xl border ${
                        errors.content ? "border-red-500" : "border-white/20"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm leading-relaxed min-h-[380px] lg:min-h-[440px]`}
                    />
                    {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
                  </div>
                ) : (
                  <div className="flex-grow w-full p-6 bg-white/5 border border-white/10 rounded-xl overflow-y-auto min-h-[380px] max-h-[550px]">
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-white/80 break-words [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4 [&_iframe]:border [&_iframe]:border-white/10 [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_th]:border [&_th]:border-white/20 [&_th]:p-2.5 [&_th]:bg-white/10 [&_th]:text-white [&_td]:border [&_td]:border-white/10 [&_td]:p-2.5 [&_details]:bg-white/5 [&_details]:p-3 [&_details]:rounded-xl [&_details]:border [&_details]:border-white/10 [&_details]:my-3 [&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-blue-400 [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10">
                      {content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkBreaks, remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {normalizeContent(content)}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-white/40 italic">Nothing to preview yet. Start writing in the Write tab, or upload a .md / .html file!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              type="submit"
              className="px-12 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 hover:scale-105 transition-all duration-300 disabled:bg-gray-600 disabled:scale-100 shadow-xl shadow-blue-600/20 flex items-center gap-2 mx-auto cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Submit for Approval"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center transform animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Submission Successful!</h3>
            <p className="text-white/70 mb-8 leading-relaxed">
              Thank you for contributing to the Hyderabad Beatbox Community. Your blog will be reviewed by our admin team and published within <span className="text-blue-400 font-bold">48 hours</span>.
            </p>
            <button
              onClick={() => router.push("/blog")}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { stripFormatting, normalizeContent } from "@/lib/blogUtils";
import BlogDetail from "@/components/BlogDetail";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { upload } from "@imagekit/next";
import { 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  X, 
  Save, 
  Upload, 
  Sparkles, 
  FileCode, 
  Check, 
  Loader2 
} from "lucide-react";

interface BlogType {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

/**
 * Client-side canvas compression to ensure images stay under 1MB.
 */
async function compressImageTo1MB(file: File): Promise<File> {
  const ONE_MB = 1024 * 1024;
  if (file.size <= ONE_MB) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
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
              if (blob.size <= ONE_MB || q <= 0.45) {
                const newName = file.name.replace(/\.[^.]+$/, ".jpg");
                resolve(new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() }));
              } else {
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

export default function BlogManager() {
  const [pendingBlogs, setPendingBlogs] = useState<BlogType[]>([]);
  const [approvedBlogs, setApprovedBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [viewingBlog, setViewingBlog] = useState<BlogType | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogType | null>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editTab, setEditTab] = useState<"write" | "preview">("write");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const editDocInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const [pendingRes, approvedRes] = await Promise.all([
        fetch("/api/blogs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/blogs"),
      ]);
      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      setPendingBlogs(Array.isArray(pendingData) ? pendingData : []);
      setApprovedBlogs(Array.isArray(approvedData) ? approvedData : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/blogs/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBlogs();
    } catch (error) {
      console.error("Error approving blog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (viewingBlog?._id === id) setViewingBlog(null);
      if (editingBlog?._id === id) setEditingBlog(null);
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const openEditModal = (blog: BlogType) => {
    setEditingBlog(blog);
    setEditTitle(blog.title);
    setEditAuthor(blog.author);
    setEditContent(blog.content);
    setEditImage(blog.image);
    setEditTab("write");
    setEditError(null);
  };

  const handleEditDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isHtml = file.name.endsWith(".html") || file.name.endsWith(".htm");
    const reader = new FileReader();
    reader.onload = (event) => {
      let rawText = (event.target?.result as string) || "";
      if (!rawText) return;

      if (isHtml) {
        const titleMatch = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1] && !editTitle.trim()) {
          setEditTitle(titleMatch[1].trim());
        }

        const styleMatches = rawText.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
        const extractedStyles = styleMatches.join("\n\n");

        const bodyMatch = rawText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch && bodyMatch[1] ? bodyMatch[1].trim() : rawText.trim();

        if (extractedStyles && !bodyContent.includes("<style")) {
          bodyContent = `${extractedStyles}\n\n${bodyContent}`;
        }
        rawText = normalizeContent(bodyContent);
      } else {
        const mdTitleMatch = rawText.match(/^#\s+(.+)$/m);
        if (mdTitleMatch && mdTitleMatch[1] && !editTitle.trim()) {
          setEditTitle(mdTitleMatch[1].trim());
        }
        rawText = normalizeContent(rawText);
      }

      setEditContent(rawText);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setEditSubmitting(true);
    setEditError(null);
    setUploadStatus("Compressing image...");

    try {
      const ONE_MB = 1024 * 1024;
      let fileToUpload = rawFile;
      if (rawFile.size > ONE_MB) {
        fileToUpload = await compressImageTo1MB(rawFile);
      }

      setUploadStatus("Uploading to ImageKit...");
      const authResponse = await fetch("/api/imagekit/auth");
      const { token, expire, signature, publicKey } = await authResponse.json();

      const result = await upload({
        file: fileToUpload,
        fileName: fileToUpload.name,
        publicKey,
        token,
        expire,
        signature,
        folder: "hyd_site_blog_uimages",
      });

      setEditImage(result.url || "");
    } catch (err: any) {
      setEditError("Image upload failed: " + err.message);
    } finally {
      setEditSubmitting(false);
      setUploadStatus(null);
    }
  };

  const handleSaveEdit = async (approveAfterSave: boolean = false) => {
    if (!editingBlog) return;
    if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim() || !editImage.trim()) {
      setEditError("Title, author, content, and cover image are all required.");
      return;
    }

    setEditSubmitting(true);
    setEditError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const normalized = normalizeContent(editContent);
      const res = await fetch(`/api/blogs/${editingBlog._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          author: editAuthor,
          content: normalized,
          image: editImage,
          status: approveAfterSave ? "approved" : editingBlog.status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update blog");
      }

      const updated = await res.json();

      // If we are currently reading this blog, update viewingBlog state as well
      if (viewingBlog?._id === updated._id) {
        setViewingBlog(updated);
      }

      setEditingBlog(null);
      await fetchBlogs();
    } catch (err: any) {
      setEditError(err.message || "Failed to save changes.");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-2xl shadow-2xl text-white">
      {/* Hidden file input for importing .md/.html in Edit modal */}
      <input
        type="file"
        ref={editDocInputRef}
        accept=".md,.markdown,.html,.htm,.txt"
        onChange={handleEditDocUpload}
        className="hidden"
      />

      <div className="space-y-10">
        {/* PENDING BLOGS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <span>Pending Blogs</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingBlogs.length}
              </span>
            </h2>
            <p className="text-xs text-white/50">
              Click &ldquo;Read Blog&rdquo; to review the full content before approving.
            </p>
          </div>

          {pendingBlogs.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-80" />
              <p className="text-white/60 text-sm">No pending blogs to review. All caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white/5 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg shadow-black/40 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Needs Approval
                      </span>
                      <span className="text-[11px] text-white/40">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-white/60 mb-2">By {blog.author}</p>

                    <div 
                      onClick={() => setViewingBlog(blog)}
                      className="relative w-full h-44 rounded-lg overflow-hidden my-2 border border-white/10 cursor-pointer group/img"
                    >
                      <Image 
                        src={blog.image} 
                        alt={blog.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover/img:scale-105" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-xs font-bold bg-black/80 px-3 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Read Full Blog
                        </span>
                      </div>
                    </div>

                    <p className="text-white/70 text-xs line-clamp-2 mt-2 leading-relaxed">
                      {stripFormatting(blog.content, 120)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingBlog(blog)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Read full article with original formatting"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Read Blog
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(blog)}
                        className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-200 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Edit title, content, or cover image"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(blog._id)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-600/70 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Delete Blog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APPROVED BLOGS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <span>Approved & Published Blogs</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {approvedBlogs.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg shadow-black/40 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live on Site
                    </span>
                    <span className="text-[11px] text-white/40">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-white/60 mb-2">By {blog.author}</p>

                  <div 
                    onClick={() => setViewingBlog(blog)}
                    className="relative w-full h-44 rounded-lg overflow-hidden my-2 border border-white/10 cursor-pointer group/img"
                  >
                    <Image 
                      src={blog.image} 
                      alt={blog.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover/img:scale-105" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs font-bold bg-black/80 px-3 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Read Full Blog
                      </span>
                    </div>
                  </div>

                  <p className="text-white/70 text-xs line-clamp-2 mt-2 leading-relaxed">
                    {stripFormatting(blog.content, 120)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingBlog(blog)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> Read
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(blog)}
                    className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-200 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(blog._id)}
                    className="bg-red-600/70 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Delete Blog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN REUSABLE BLOG VIEWER MODAL (Uses exact BlogDetail component!) */}
      {viewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto animate-in fade-in duration-200">
          <div className="sticky top-0 z-50 bg-black/90 border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Admin Reader View
              </span>
              <span className="text-sm text-white/60">
                Status: <strong className={viewingBlog.status === "pending" ? "text-amber-400" : "text-emerald-400"}>{viewingBlog.status.toUpperCase()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const b = viewingBlog;
                  setViewingBlog(null);
                  openEditModal(b);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Blog
              </button>
              {viewingBlog.status === "pending" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleApprove(viewingBlog._id);
                    setViewingBlog(null);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  ✓ Approve Blog
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingBlog(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-28">
            <BlogDetail
              initialBlog={viewingBlog}
              isAdminView={true}
            />
          </div>
        </div>
      )}

      {/* ADMIN EDIT BLOG MODAL */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/15 rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  Edit Blog Post
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Update title, author, cover image, or Markdown/HTML content.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {editError}
              </div>
            )}

            {/* Scrollable Form Content */}
            <div className="flex-grow overflow-y-auto space-y-5 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Blog Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Enter blog title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Enter author..."
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Cover Image URL / Upload (1MB max, auto-compressed)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="flex-grow w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    placeholder="https://ik.imagekit.io/..."
                  />
                  <label className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer border border-white/15 transition-all flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-4 h-4 text-sky-400" />
                    Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadStatus && <p className="text-xs text-blue-400 mt-1 animate-pulse">{uploadStatus}</p>}
                {editImage && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-white/15">
                    <img src={editImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold text-white/80">
                    Blog Content (Markdown & HTML Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => editDocInputRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload .md / .html file</span>
                  </button>
                </div>

                {/* Tabs: Write & Live Preview */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                  <button
                    type="button"
                    onClick={() => setEditTab("write")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editTab === "write" ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Write (Code)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editTab === "preview" ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                {editTab === "write" ? (
                  <textarea
                    rows={14}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/15 rounded-xl text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                    placeholder="Enter or paste Markdown or HTML here..."
                  />
                ) : (
                  <div className="p-5 bg-white/5 border border-white/10 rounded-xl overflow-y-auto max-h-[420px]">
                    <div className="prose prose-sm prose-invert max-w-none text-white/80 break-words [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/20 [&_th]:p-2.5 [&_td]:border [&_td]:border-white/10 [&_td]:p-2.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks, remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {normalizeContent(editContent)}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                disabled={editSubmitting}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {editingBlog.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(true)}
                    disabled={editSubmitting}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Save & Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveEdit(false)}
                  disabled={editSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

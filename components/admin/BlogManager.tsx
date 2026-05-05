"use client";

import { useState, useEffect } from "react";

export default function BlogManager() {
  const [pendingBlogs, setPendingBlogs] = useState<any[]>([]);
  const [approvedBlogs, setApprovedBlogs] = useState<any[]>([]);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [pending, approved] = await Promise.all([
        fetch("/api/blogs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/blogs"),
      ]);
      setPendingBlogs(await pending.json());
      setApprovedBlogs(await approved.json());
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/blogs/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error approving blog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto text-white">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#0066FF]">Pending Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBlogs.map((blog) => (
              <div key={blog._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">{blog.title}</h3>
                <p className="text-white/60 mb-2">By {blog.author}</p>
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-lg my-2" />
                <p className="text-white/80 text-sm line-clamp-3">{blog.content}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleApprove(blog._id)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold">Approve</button>
                  <button onClick={() => handleDelete(blog._id)} className="flex-1 bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#0066FF]">Approved Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedBlogs.map((blog) => (
              <div key={blog._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">{blog.title}</h3>
                <p className="text-white/60 mb-2">By {blog.author}</p>
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-lg my-2" />
                <p className="text-white/80 text-sm line-clamp-3">{blog.content}</p>
                <div className="mt-4">
                  <button onClick={() => handleDelete(blog._id)} className="w-full bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

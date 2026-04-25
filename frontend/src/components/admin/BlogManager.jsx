import React, { useState, useEffect } from "react";
import axios from "axios";

function BlogManager() {
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [approvedBlogs, setApprovedBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [pending, approved] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/blogs/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/blogs`),
      ]);
      setPendingBlogs(pending.data);
      setApprovedBlogs(approved.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlogs();
    } catch (error) {
      console.error("Error approving blog:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto text-white">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBlogs.map((blog) => (
              <div key={blog._id} className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="text-xl font-bold">{blog.title}</h3>
                <p>By {blog.author}</p>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-lg my-2"
                />
                <p>{blog.content.substring(0, 100)}...</p>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleApprove(blog._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Approved Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedBlogs.map((blog) => (
              <div key={blog._id} className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="text-xl font-bold">{blog.title}</h3>
                <p>By {blog.author}</p>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-lg my-2"
                />
                <p>{blog.content.substring(0, 100)}...</p>
                <div className="mt-4">
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogManager;
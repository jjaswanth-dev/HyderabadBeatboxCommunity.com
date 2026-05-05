"use client";

import { useState, useEffect } from "react";

export default function VideosManager() {
  const [videos, setVideos] = useState<any[]>([]);
  const [newVideo, setNewVideo] = useState({ url: "", title: "" });

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newVideo),
      });
      fetchVideos();
      setNewVideo({ url: "", title: "" });
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/videos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={newVideo.url} onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })} placeholder="YouTube URL" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <input type="text" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} placeholder="Video Title" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold uppercase tracking-wider shadow-lg">Add Video</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col">
              <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover rounded-lg" />
              <h3 className="text-white font-bold mt-3 mb-2">{video.title}</h3>
              <button onClick={() => handleDelete(video._id)} className="bg-red-600/80 text-white px-2 py-2 rounded-lg mt-auto hover:bg-red-700 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

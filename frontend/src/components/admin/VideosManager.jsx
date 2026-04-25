import React, { useState, useEffect } from "react";
import axios from "axios";

function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    url: "",
    title: "",
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/videos`
      );
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/videos`,
        newVideo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchVideos();
      setNewVideo({ url: "", title: "" });
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/videos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newVideo.url}
            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
            placeholder="YouTube URL"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newVideo.title}
            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
            placeholder="Video Title"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Video
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="bg-white bg-opacity-20 p-4 rounded-lg">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <h3 className="text-white mt-2">{video.title}</h3>
              <button
                onClick={() => handleDelete(video._id)}
                className="bg-red-600 text-white px-2 py-1 rounded-lg mt-2 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideosManager;
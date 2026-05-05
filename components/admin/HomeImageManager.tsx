"use client";

import { useState, useEffect } from "react";

export default function HomeImageManager() {
  const [images, setImages] = useState<any[]>([]);
  const [newImage, setNewImage] = useState("");

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/home-images");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await fetch("/api/home-images", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: newImage }),
      });
      fetchImages();
      setNewImage("");
    } catch (error) {
      console.error("Error creating home image:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/home-images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Image URL" className="w-full p-3 bg-white/70 backdrop-blur-md text-black placeholder:text-gray-600 rounded-lg border border-white/40 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" />
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold uppercase tracking-wider shadow-lg">Add Image</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col">
              <img src={image.image} alt="Home Image" className="w-full h-48 object-cover rounded-lg" />
              <button onClick={() => handleDelete(image._id)} className="bg-red-600/80 text-white px-2 py-2 rounded-lg mt-3 hover:bg-red-700 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

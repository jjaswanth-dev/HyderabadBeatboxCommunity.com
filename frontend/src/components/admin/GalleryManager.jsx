import React, { useState, useEffect } from "react";
import axios from "axios";

function GalleryManager() {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({
    image: "",
    title: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery`
      );
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery`,
        {
          image: newImage.image,
          title: newImage.title,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchImages();
      setNewImage({ image: "", title: "" });
    } catch (error) {
      console.error("Error creating gallery item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg h-[32rem] overflow-y-auto">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newImage.image}
            onChange={(e) => setNewImage({ ...newImage, image: e.target.value })}
            placeholder="Image URL"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            value={newImage.title}
            onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
            placeholder="Image Title"
            className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Image
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image._id} className="bg-white bg-opacity-20 p-4 rounded-lg">
              <img
                src={image.image}
                alt={image.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p className="text-white mt-2">{image.title}</p>
              <button
                onClick={() => handleDelete(image._id)}
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

export default GalleryManager;
import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EventsManager from "./EventsManager";
import GalleryManager from "./GalleryManager";
import VideosManager from "./VideosManager";
import HomeImageManager from "./HomeImageManager";
import BlogManager from "./BlogManager";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://t3.ftcdn.net/jpg/10/23/94/68/360_F_1023946869_TID7KbKpSoPkS0TG8wQHeWH0QwNJBAGo.jpg')",
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-50 backdrop-blur-lg">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white bg-opacity-10 p-4 shadow-lg"
        >
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold tracking-wider">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.nav>

        <div className="container mx-auto p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
          >
            <Link to="events">
              <motion.div
                variants={itemVariants}
                className="bg-white bg-opacity-10 p-6 rounded-xl text-center hover:bg-opacity-20 transition-all cursor-pointer shadow-lg"
              >
                <h2 className="text-xl text-white font-semibold">Manage Events</h2>
              </motion.div>
            </Link>
            <Link to="gallery">
              <motion.div
                variants={itemVariants}
                className="bg-white bg-opacity-10 p-6 rounded-xl text-center hover:bg-opacity-20 transition-all cursor-pointer shadow-lg"
              >
                <h2 className="text-xl text-white font-semibold">Manage Gallery</h2>
              </motion.div>
            </Link>
            <Link to="videos">
              <motion.div
                variants={itemVariants}
                className="bg-white bg-opacity-10 p-6 rounded-xl text-center hover:bg-opacity-20 transition-all cursor-pointer shadow-lg"
              >
                <h2 className="text-xl text-white font-semibold">Manage Videos</h2>
              </motion.div>
            </Link>
            <Link to="home-images">
              <motion.div
                variants={itemVariants}
                className="bg-white bg-opacity-10 p-6 rounded-xl text-center hover:bg-opacity-20 transition-all cursor-pointer shadow-lg"
              >
                <h2 className="text-xl text-white font-semibold">
                  Manage Home Images
                </h2>
              </motion.div>
            </Link>
            <Link to="blogs">
              <motion.div
                variants={itemVariants}
                className="bg-white bg-opacity-10 p-6 rounded-xl text-center hover:bg-opacity-20 transition-all cursor-pointer shadow-lg"
              >
                <h2 className="text-xl text-white font-semibold">Manage Blogs</h2>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Routes>
              <Route path="events" element={<EventsManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="videos" element={<VideosManager />} />
              <Route path="home-images" element={<HomeImageManager />} />
              <Route path="blogs" element={<BlogManager />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
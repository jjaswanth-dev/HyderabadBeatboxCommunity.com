"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import Section from "./Section";
import LoadingSpinner from "./LoadingSpinner";

interface VideoType {
  _id: string;
  url: string;
  title: string;
  thumbnail: string;
}

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  useEffect(() => {
    fetchVideos(6);
  }, []);

  const fetchVideos = async (limit: number | null = null) => {
    try {
      if (limit) setLoading(true);
      const queryLimit = limit ? limit + 1 : null;
      const url = queryLimit
        ? `/api/videos?limit=${queryLimit}`
        : `/api/videos`;
      const res = await fetch(url);
      const data = await res.json();

      if (limit && data.length > limit) {
        setVideos(data.slice(0, limit));
        setIsAllLoaded(false);
      } else {
        setVideos(data);
        setIsAllLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section id="videos" className="section-padding bg-black/50">
        <div className="container-width">
          <h2 className="section-title text-center">Featured Videos</h2>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="videos" className="section-padding bg-black/50">
      <div className="container-width">
        <h2 className="section-title text-center">Featured Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <motion.div
              key={video._id}
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative overflow-hidden rounded-xl aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="w-16 h-16 bg-[#0066FF]/90 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                {video.title}
              </h3>
            </motion.div>
          ))}
        </div>
        {!isAllLoaded && (
          <div className="text-center mt-12">
            <button
              onClick={() => fetchVideos()}
              className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors duration-300"
            >
              View all Videos
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="relative pb-[56.25%]">
                <iframe
                  src={selectedVideo.url}
                  title={selectedVideo.title}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

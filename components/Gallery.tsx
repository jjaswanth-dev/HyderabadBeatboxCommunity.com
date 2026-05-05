"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import LoadingSpinner from "./LoadingSpinner";
import DomeGallery from "./DomeGallery";

export default function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setImages(data.map((img: any) => ({
        src: `${img.image}?tr=w-400,h-400,c-at_max,q-80`, // Use ImageKit thumbnail for performance
        original: img.image, // Pass original for the enlarged view
        alt: img.title
      })));
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section id="gallery" className="py-16 md:py-32 bg-black">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-16 text-center gradient-text">
          Gallery
        </h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Section>
    );
  }

  return (
    <Section id="gallery" className="py-16 md:py-32 overflow-hidden px-0 bg-black">
      <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-16 text-center gradient-text">
        HBX Gallery
      </h2>
      <div className="h-[90vh] md:h-screen w-full relative">
        {/* Top Fade Mask */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

        <DomeGallery images={images} />

        {/* Bottom Fade Mask */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </div>
      <div className="text-center mt-8 px-4">
        <p className="text-white/50 text-sm italic">Drag to explore the community moments • Click to zoom</p>
      </div>
    </Section>
  );
}

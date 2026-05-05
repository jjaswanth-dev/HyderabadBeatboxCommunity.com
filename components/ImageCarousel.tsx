"use client";

import { useState, useEffect } from "react";
import { LuMicVocal } from "react-icons/lu";

export default function ImageCarousel() {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);

  useEffect(() => {
    const localImages = [
      "/home1.webp",
      "/home2.webp",
      "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/IMG_7329.JPG?updatedAt=1764590542631",
      "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/Home%20pics/home3.webp?updatedAt=1764590230088",
      "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/Home%20pics/home4.webp?updatedAt=1764590230634",
      "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/Home%20pics/Home5.webp?updatedAt=1764590230074",
      "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/Home%20pics/Home6.webp?updatedAt=1764590230078",
    ];

    if (localImages.length > 0) {
      const firstImage = new Image();
      firstImage.src = localImages[0];
      firstImage.onload = () => {
        setImages(localImages);
        setIsCarouselVisible(true);
      };
    } else {
      setIsCarouselVisible(true);
    }
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div id="home" className="relative h-screen overflow-hidden bg-black">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isCarouselVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt="Landscape"
              className="w-full h-full object-cover"
            />
            <div className="hero-gradient absolute inset-0" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-8 max-w-5xl mt-80">
          <LuMicVocal className="w-16 h-16 mx-auto mb-6 text-white animate-pulse" />
          <h1 className="text-4xl md:text-8xl font-bold mb-8 text-gradient tracking-tight">
            Hyderabad Beatbox Community
          </h1>
          <p className="text-xl md:text-xl text-white/60 max-w-2xl mx-auto">
            Uniting rhythms, creating beats, building community
          </p>
        </div>
      </div>
    </div>
  );
}

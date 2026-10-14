"use client";

import { useState, useEffect } from "react";
import { LuMicVocal } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import TicketButton from "@/components/TicketButton";

export default function ImageCarousel({ initialImages = ["/home1.webp"] }: { initialImages?: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);
  // Initialize with server pre-fetched images (or fallback to single static /home1.webp)
  const [images, setImages] = useState<string[]>(
    initialImages && initialImages.length > 0 ? initialImages : ["/home1.webp"]
  );
  const [isCarouselVisible, setIsCarouselVisible] = useState(true);
  const [isWildcardActive, setIsWildcardActive] = useState(false);
  const [ticketConfig, setTicketConfig] = useState<{
    isActive: boolean;
    formUrl?: string;
    title?: string;
    eventTag?: string;
    admitText?: string;
    serialNumber?: string;
    priceText?: string;
  } | null>(null);

  useEffect(() => {
    const checkStatuses = async () => {
      try {
        const [wildcardRes, ticketRes] = await Promise.allSettled([
          fetch("/api/wildcard"),
          fetch("/api/ticket"),
        ]);

        if (wildcardRes.status === "fulfilled" && wildcardRes.value.ok) {
          const wData = await wildcardRes.value.json();
          if (wData && wData.isActive) setIsWildcardActive(true);
        }

        if (ticketRes.status === "fulfilled" && ticketRes.value.ok) {
          const tData = await ticketRes.value.json();
          if (tData && tData.isActive) {
            setTicketConfig(tData);
          }
        }
      } catch (err) {
        console.error("Error checking feature statuses in ImageCarousel:", err);
      }
    };
    checkStatuses();
  }, []);

  // Sync with client-side API in the background (if admin recently uploaded new images)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/home-images");
        const data = await res.json();

        if (data && data.length > 0) {
          const dbImages = data.map((item: any) => item.image);
          setImages(dbImages);
        }
      } catch (error) {
        console.error("Error fetching carousel images:", error);
      }
    };

    fetchImages();
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
        className={`absolute inset-0 transition-opacity duration-400 ${
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
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0}
              unoptimized={src.startsWith("http")}
              className="object-cover scale-100"
              sizes="100vw"
            />
            <div className="hero-gradient absolute inset-0" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-start justify-start p-6 md:p-16 z-10">
        <div className="text-left max-w-xl mt-24 md:mt-28 space-y-4">
          <LuMicVocal className="w-10 h-10 text-white animate-pulse" />
          <h1 className="text-2xl md:text-4xl font-bold text-gradient tracking-tight">
            Hyderabad Beatbox Community
          </h1>
          <p className="text-sm md:text-base text-white/60">
            Uniting rhythms, creating beats, building community
          </p>
          {(ticketConfig?.isActive || isWildcardActive) && (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {ticketConfig?.isActive && (
                <TicketButton
                  formUrl={ticketConfig.formUrl}
                  title={ticketConfig.title}
                  eventTag={ticketConfig.eventTag}
                  admitText={ticketConfig.admitText}
                  serialNumber={ticketConfig.serialNumber}
                  priceText={ticketConfig.priceText}
                />
              )}
              {isWildcardActive && (
                <button
                  onClick={() => {
                    window.location.href = "/wildcard";
                  }}
                  className="px-5 py-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md font-bold text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer inline-block font-sans"
                >
                  Submit Wildcards Now!
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

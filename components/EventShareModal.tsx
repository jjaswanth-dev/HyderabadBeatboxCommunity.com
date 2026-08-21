"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Check,
  Copy,
  Calendar,
  MapPin,
  Send,
  Download,
  Flame,
  Radio,
  Loader2,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";
import { generateStoryCardBlob } from "@/lib/storyCardGenerator";

interface EventType {
  _id: string;
  title: string;
  date: string;
  description: string;
  details?: string[];
  location?: string;
  image?: string;
  ticketLink?: string;
}

export default function EventShareModal({
  event,
  onClose
}: {
  event: EventType;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyStatusNotice, setStoryStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setShareUrl(`${origin}/events/${event._id}`);
    }
  }, [event._id]);

  const showNotice = (msg: string) => {
    setStoryStatusNotice(msg);
    setTimeout(() => {
      setStoryStatusNotice(null);
    }, 4500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyCaption = async () => {
    const caption = `🔥 Don't miss ${event.title}!\n📅 Date: ${event.date}${event.location ? `\n📍 Venue: ${event.location}` : ""}\n\n🎟️ Details & Tickets: ${shareUrl}\n\n#HyderabadBeatbox #BeatboxCommunity #BeatboxIndia #HBX`;
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error("Failed to copy caption:", err);
    }
  };

  // 1. Share to Instagram Stories
  const handleInstagramStoryShare = async () => {
    setIsGeneratingStory(true);
    try {
      const blob = await generateStoryCardBlob({
        title: event.title,
        date: event.date,
        location: event.location,
        image: event.image,
        shareUrl
      });

      const fileName = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-story.png`;
      const storyFile = new File([blob], fileName, { type: "image/png" });

      // Auto copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (clipErr) {
        console.warn("Clipboard auto-copy:", clipErr);
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [storyFile] })
      ) {
        showNotice("Link copied! Choose Instagram Stories in the share drawer.");
        await navigator.share({
          title: `${event.title} | Hyderabad Beatbox`,
          text: `${event.title} | ${event.date} • ${shareUrl}`,
          url: shareUrl,
          files: [storyFile]
        });
      } else {
        // Fallback: download card & open Instagram
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotice("Story card downloaded & Link copied! Opening Instagram...");
        
        setTimeout(() => {
          window.location.href = "instagram://story-camera";
        }, 1000);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error sharing story:", err);
        showNotice("Story card saved to gallery.");
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 2. Direct Download of Story Card
  const handleDownloadStoryCard = async () => {
    setIsGeneratingStory(true);
    try {
      const blob = await generateStoryCardBlob({
        title: event.title,
        date: event.date,
        location: event.location,
        image: event.image,
        shareUrl
      });
      const fileName = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-story-card.png`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotice("Story Card downloaded to your device.");
    } catch (err) {
      console.error("Failed to download story image:", err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 3. General Device Share
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${event.title} | Hyderabad Beatbox Community`,
          text: `Check out ${event.title} on ${event.date}!`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error with native share:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`🔥 Check out *${event.title}* on ${event.date}!\n\n${shareUrl}`);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 14 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        className="relative w-full max-w-lg rounded-2xl bg-[#0c0c0c] border border-white/10 p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0066FF]/15 flex items-center justify-center border border-[#0066FF]/30 flex-shrink-0">
              <Share2 className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white leading-none truncate">Share Event</h3>
              <p className="text-xs text-white/50 mt-1 truncate">Minimalist Event Card & Story</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer flex-shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Status Notice */}
          <AnimatePresence>
            {storyStatusNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse flex-shrink-0" />
                <span className="leading-snug">{storyStatusNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MINIMALIST RESPONSIVE PREVIEW CARD (Clickable to URL) --- */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Live Preview
              </span>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#0066FF] hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Clickable Card */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-xl bg-[#141414] border border-white/10 p-3.5 sm:p-4 shadow-lg transition-all duration-300 hover:border-white/20 hover:bg-[#181818] cursor-pointer"
            >
              <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 sm:items-center">
                {/* Event Thumbnail */}
                <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1c1c1c] flex items-center justify-center">
                      <Flame className="w-7 h-7 text-[#0066FF]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                  <div className="absolute bottom-2 left-2 sm:hidden px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-[#0066FF]" /> HBX EVENT
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="flex-1 min-w-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-[#0066FF] uppercase tracking-wider mb-1">
                    <Radio className="w-3 h-3" /> HYD BEATBOX EVENT
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug break-words line-clamp-2">
                    {event.title}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-white/70 mt-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                    <span className="truncate">{event.date}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-white/50 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {/* Clickable Link Indicator Bar */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                    <span className="flex items-center gap-1 truncate font-mono text-[#0066FF]">
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{shareUrl.replace(/^https?:\/\//, "")}</span>
                    </span>
                    <span className="flex-shrink-0 flex items-center gap-0.5 text-white/40 group-hover:text-white font-medium pl-1">
                      Visit ↗
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* --- INSTAGRAM STORIES BUTTONS --- */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Instagram Stories
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Primary Action Button */}
              <button
                onClick={handleInstagramStoryShare}
                disabled={isGeneratingStory}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-60 col-span-1 sm:col-span-2"
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Story Graphic...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Share to Instagram Stories</span>
                  </>
                )}
              </button>

              {/* Download Story Card */}
              <button
                onClick={handleDownloadStoryCard}
                disabled={isGeneratingStory}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#0066FF]" />
                <span>Download Story Card</span>
              </button>

              {/* Copy Caption */}
              <button
                onClick={handleCopyCaption}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.01] cursor-pointer ${
                  copiedCaption
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                }`}
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#0066FF]" />}
                <span className="truncate">{copiedCaption ? "Caption Copied!" : "Copy Caption"}</span>
              </button>
            </div>
          </div>

          {/* --- OTHER PLATFORMS --- */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Other Platforms
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-[#0066FF]/20 border border-white/10 hover:border-[#0066FF]/40 text-white text-xs font-semibold transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#0066FF]" />
                <span>Device Share</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/50 text-white hover:text-[#25D366] text-xs font-semibold transition-all hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.885-6.974C16.526 1.909 14.058.882 11.433.882c-5.449 0-9.873 4.42-9.877 9.855-.001 1.748.458 3.454 1.328 4.962L1.87 21.03l5.09-1.332z" />
                  <path d="M16.924 13.886c-.27-.135-1.595-.788-1.842-.878-.248-.09-.43-.135-.61.135-.18.27-.697.878-.853 1.058-.157.18-.314.202-.584.067-.27-.135-1.14-.42-2.172-1.34-.803-.717-1.345-1.603-1.502-1.873-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.473.135-.157.18-.27.27-.45.09-.18.045-.337-.022-.473-.068-.135-.61-1.467-.835-2.012-.22-.53-.44-.457-.61-.466-.157-.008-.337-.01-.518-.01a1.004 1.004 0 00-.727.338c-.248.27-.945.923-.945 2.25s.968 2.61 1.103 2.79c.135.18 1.906 2.91 4.618 4.08.645.278 1.148.445 1.54.57.648.206 1.24.177 1.706.108.52-.078 1.595-.653 1.82-1.283.226-.63.226-1.17.157-1.283-.067-.113-.248-.18-.518-.315z" fillRule="evenodd" />
                </svg>
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title} | Hyderabad Beatbox Community:`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🔥 Join us at ${event.title} on ${event.date}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-[#229ED9]/20 border border-white/10 hover:border-[#229ED9]/50 text-white hover:text-[#229ED9] text-xs font-semibold transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="pt-1">
            <div className="flex items-center gap-2 p-1.5 bg-[#141414] border border-white/10 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-white/70 px-2 focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[#0066FF] hover:bg-blue-600 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

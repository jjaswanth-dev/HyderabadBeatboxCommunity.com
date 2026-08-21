"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Share2,
  Check,
  Copy,
  Calendar,
  MapPin,
  Sparkles,
  Send,
  ExternalLink,
  Smartphone,
  Flame,
  Radio
} from "lucide-react";

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
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setShareUrl(`${origin}/events/${event._id}`);
    }
  }, [event._id]);

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
    const caption = `🔥 Don't miss ${event.title}! 🎤\n📅 Date: ${event.date}${event.location ? `\n📍 Venue: ${event.location}` : ""}\n\n🎟️ Details & Tickets: ${shareUrl}\n\n#HyderabadBeatbox #BeatboxCommunity #BeatboxIndia #HBX`;
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error("Failed to copy caption:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${event.title} | Hyderabad Beatbox Community`,
          text: `Check out this upcoming beatbox event: ${event.title} on ${event.date}!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error with native share:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`🔥 Check out *${event.title}* on ${event.date}!\n\n${shareUrl}`);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-2xl glass-effect border border-white/15 p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0066FF]/20 flex items-center justify-center border border-[#0066FF]/40">
              <Share2 className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Share Event</h3>
              <p className="text-xs text-white/50 mt-0.5">Spotify & Social Story Style Preview Card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* --- SPOTIFY-STYLE PREVIEW CARD --- */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" /> Preview Card
          </p>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-black to-[#001433] border border-white/15 p-4 shadow-xl group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#0066FF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex gap-4 items-center">
              {/* Event Thumbnail */}
              {event.image ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-white/10 shadow-lg relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-[#0066FF]/30 to-purple-600/30 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg">
                  <Flame className="w-10 h-10 text-[#0066FF]" />
                </div>
              )}

              {/* Card Meta Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0066FF] uppercase tracking-wider mb-1">
                  <Radio className="w-3 h-3 animate-pulse" /> HYD BEATBOX EVENT
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {event.title}
                </h4>

                <div className="flex items-center gap-1 text-xs text-white/70 mt-1 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                  <span className="truncate">{event.date}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-white/50 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* --- SHARING PLATFORM ACTIONS --- */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
            Share to Platforms
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Native Share / Story Drawer */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-white text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer col-span-2 sm:col-span-3"
            >
              <Smartphone className="w-4 h-4 text-pink-400" />
              <span>Share via Device (Instagram Stories, Snapchat, Apps)</span>
            </button>

            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/50 text-white hover:text-[#25D366] text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.885-6.974C16.526 1.909 14.058.882 11.433.882c-5.449 0-9.873 4.42-9.877 9.855-.001 1.748.458 3.454 1.328 4.962L1.87 21.03l5.09-1.332z" />
                <path d="M16.924 13.886c-.27-.135-1.595-.788-1.842-.878-.248-.09-.43-.135-.61.135-.18.27-.697.878-.853 1.058-.157.18-.314.202-.584.067-.27-.135-1.14-.42-2.172-1.34-.803-.717-1.345-1.603-1.502-1.873-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.473.135-.157.18-.27.27-.45.09-.18.045-.337-.022-.473-.068-.135-.61-1.467-.835-2.012-.22-.53-.44-.457-.61-.466-.157-.008-.337-.01-.518-.01a1.004 1.004 0 00-.727.338c-.248.27-.945.923-.945 2.25s.968 2.61 1.103 2.79c.135.18 1.906 2.91 4.618 4.08.645.278 1.148.445 1.54.57.648.206 1.24.177 1.706.108.52-.078 1.595-.653 1.82-1.283.226-.63.226-1.17.157-1.283-.067-.113-.248-.18-.518-.315z" fillRule="evenodd" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title} | Hyderabad Beatbox Community:`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🔥 Join us at ${event.title} on ${event.date}!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-[#229ED9]/20 border border-white/10 hover:border-[#229ED9]/50 text-white hover:text-[#229ED9] text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/50 text-white hover:text-[#1877F2] text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            {/* Copy Story Caption */}
            <button
              onClick={handleCopyCaption}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer col-span-2 sm:col-span-2 ${copiedCaption
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                }`}
            >
              {copiedCaption ? <Check className="w-4 h-4 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{copiedCaption ? "Caption Copied for Story!" : "Copy Caption for Instagram"}</span>
            </button>
          </div>

          {/* Copy Link Input Bar */}
          <div className="pt-2">
            <div className="flex items-center gap-2 p-2 bg-black/50 border border-white/10 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-white/70 px-2 focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${copied
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

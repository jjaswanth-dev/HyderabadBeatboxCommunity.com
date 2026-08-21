"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Ticket, Share2, ArrowLeft, Check, Copy, Sparkles, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EventShareModal from "@/components/EventShareModal";

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

export default function EventDetailPageClient({ event }: { event: EventType }) {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <Link
          href="/#events"
          className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <button
          onClick={() => setShowShareModal(true)}
          className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-[#0066FF] to-blue-500 hover:from-blue-600 hover:to-blue-700 px-5 py-2 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Event</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-6 md:p-10 relative">
        {/* Cover Image */}
        {event.image && (
          <div className="relative w-full rounded-xl overflow-hidden mb-8 bg-black/40 border border-white/10 shadow-inner">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
            />
          </div>
        )}

        {/* Badges & Title */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-gradient-to-r from-[#0066FF] to-cyan-400 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-md tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Beatbox Event
            </span>
            <span className="bg-white/10 text-white/80 border border-white/15 px-3 py-1 rounded-full text-xs font-medium">
              Hyderabad Beatbox Community
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {event.title}
          </h1>

          {/* Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <Calendar className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50 font-medium">Date & Time</p>
                <p className="text-sm md:text-base text-white font-semibold">{event.date}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <MapPin className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50 font-medium">Location</p>
                  <p className="text-sm md:text-base text-white font-semibold truncate">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-white/90">About this Event</h3>
            <p className="text-white/80 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Details list */}
          {event.details && event.details.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-base font-bold text-[#0066FF]">Event Highlights & Rules:</h3>
              <ul className="space-y-2">
                {event.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm md:text-base text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-2 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
            {event.ticketLink && (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-[#0066FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Tickets</span>
              </a>
            )}

            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold py-3.5 px-6 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Preview Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <EventShareModal
            event={event}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

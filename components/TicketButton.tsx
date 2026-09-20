"use client";

import React from "react";
import Image from "next/image";

interface TicketButtonProps {
  formUrl?: string;
  className?: string;
}

// Default Google Form URL for Ticket Registration (Directly editable here)
export const DEFAULT_TICKET_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdcv5fu5yBDvrEZBXQkN8tYrRpPbxZ1qI5OE7fGZT-4LI2VLw/viewform?usp=header";

export default function TicketButton({
  formUrl = DEFAULT_TICKET_FORM_URL,
  className = "",
}: TicketButtonProps) {
  return (
    <a
      href={formUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-block select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EAFF00] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      aria-label="Buy Tickets - Hyderabad Beatbox Championship 2026"
    >
      <div className="relative isolate py-2 px-1">
        
        {/* ================================================================= */}
        {/* BACKGROUND RETRO TICKET 1 (Fans out to TOP-LEFT on hover)         */}
        {/* ================================================================= */}
        <div 
          className="absolute inset-x-1 inset-y-2 opacity-0 group-hover:opacity-90 shadow-xl shadow-purple-900/60 transition-all duration-500 ease-out pointer-events-none transform origin-bottom-center group-hover:-translate-x-5 group-hover:-translate-y-3.5 group-hover:-rotate-8 group-hover:scale-95"
          style={{ zIndex: 1 }}
        >
          {/* Retro Ticket Shell - Back 1 */}
          <div className="relative w-full h-full min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-purple-900 via-violet-800 to-purple-950 border-y-2 border-[#EAFF00]/70 rounded-none flex items-center justify-between px-5 py-2.5 overflow-hidden">
            {/* Scalloped Half-Circle Inward Cutouts - Left Edge */}
            <div className="absolute left-0 inset-y-1 w-2 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="w-2 h-2.5 bg-black rounded-r-full block border-r border-y border-[#EAFF00]/60 -ml-[1px]" />
              ))}
            </div>
            {/* Scalloped Half-Circle Inward Cutouts - Right Edge */}
            <div className="absolute right-0 inset-y-1 w-2 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="w-2 h-2.5 bg-black rounded-l-full block border-l border-y border-[#EAFF00]/60 -mr-[1px] ml-auto" />
              ))}
            </div>
            
            <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-[#EAFF00]/90 tracking-widest pl-2 pr-2">
              <span>★ ADMIT ONE ★</span>
              <span className="border-l border-dashed border-[#EAFF00]/50 h-5" />
              <span>№ 270926</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BACKGROUND RETRO TICKET 2 (Fans out to TOP-RIGHT on hover)        */}
        {/* ================================================================= */}
        <div 
          className="absolute inset-x-1 inset-y-2 opacity-0 group-hover:opacity-90 shadow-xl shadow-yellow-500/30 transition-all duration-500 ease-out pointer-events-none transform origin-bottom-center group-hover:translate-x-5 group-hover:-translate-y-3.5 group-hover:rotate-8 group-hover:scale-95"
          style={{ zIndex: 2 }}
        >
          {/* Retro Ticket Shell - Back 2 */}
          <div className="relative w-full h-full min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-[#EAFF00] via-yellow-400 to-amber-400 border-y-2 border-purple-900 rounded-none flex items-center justify-between px-5 py-2.5 text-purple-950 overflow-hidden">
            {/* Scalloped Half-Circle Inward Cutouts - Left Edge */}
            <div className="absolute left-0 inset-y-1 w-2 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="w-2 h-2.5 bg-black rounded-r-full block border-r border-y border-purple-900 -ml-[1px]" />
              ))}
            </div>
            {/* Scalloped Half-Circle Inward Cutouts - Right Edge */}
            <div className="absolute right-0 inset-y-1 w-2 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="w-2 h-2.5 bg-black rounded-l-full block border-l border-y border-purple-900 -mr-[1px] ml-auto" />
              ))}
            </div>
            
            <div className="w-full flex items-center justify-between text-[10px] font-mono font-extrabold tracking-widest pl-2 pr-2">
              <span>★ CHAMPIONSHIP 2026 ★</span>
              <span className="border-l border-dashed border-purple-950/50 h-5" />
              <span>ENTRY PASS</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN FRONT RETRO MOVIE TICKET                                     */}
        {/* ================================================================= */}
        <div 
          className="relative min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-[#0d0418] via-[#16082b] to-[#0d0418] hover:from-[#130624] hover:via-[#1f0b3d] hover:to-[#130624] text-white border-y-2 border-[#EAFF00] shadow-[0_0_25px_rgba(234,255,0,0.35),0_0_30px_rgba(88,28,135,0.6)] group-hover:shadow-[0_0_40px_rgba(234,255,0,0.7),0_0_50px_rgba(147,51,234,0.7)] transition-all duration-300 transform group-hover:scale-[1.03] overflow-hidden rounded-none"
          style={{ zIndex: 3 }}
        >
          {/* Scalloped Perforated Left Edge (True Half-Circle Inward Cutouts) */}
          <div className="absolute left-0 inset-y-1.5 w-2.5 flex flex-col justify-between pointer-events-none z-20">
            {[...Array(5)].map((_, i) => (
              <span 
                key={`left-hole-${i}`} 
                className="w-2.5 h-3 bg-black rounded-r-full block border-r-2 border-y-2 border-[#EAFF00] -ml-[1px]" 
              />
            ))}
          </div>

          {/* Scalloped Perforated Right Edge (True Half-Circle Inward Cutouts) */}
          <div className="absolute right-0 inset-y-1.5 w-2.5 flex flex-col justify-between pointer-events-none z-20">
            {[...Array(5)].map((_, i) => (
              <span 
                key={`right-hole-${i}`} 
                className="w-2.5 h-3 bg-black rounded-l-full block border-l-2 border-y-2 border-[#EAFF00] -mr-[1px] ml-auto" 
              />
            ))}
          </div>

          {/* Inner Vintage Dashed Frame */}
          <div className="relative mx-3.5 my-1.5 p-2 border border-dashed border-[#EAFF00]/50 flex items-center justify-between gap-2 sm:gap-3 bg-[#110521]/60">
            
            {/* Holographic Shimmer Sweep across the ticket */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-[#EAFF00]/15 to-transparent pointer-events-none" />

            {/* Left Side: Serial Number Stamp */}
            <div className="flex flex-col items-center justify-center border-r border-dashed border-[#EAFF00]/40 pr-2 pl-1">
              <span className="text-[8px] font-mono font-bold tracking-tighter text-[#EAFF00]/70 uppercase [writing-mode:vertical-rl] rotate-180">
                № 270926
              </span>
            </div>

            {/* Main Center Area */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
              {/* Clean HBX Icon */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <Image 
                  src="/icon.png" 
                  alt="HBX Icon" 
                  width={36} 
                  height={36} 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(234,255,0,0.6)]" 
                />
              </div>

              {/* Typography Header & Headline */}
              <div className="text-left flex flex-col">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono tracking-widest text-[#EAFF00] font-bold uppercase">
                  <span>★ ADMIT ONE</span>
                  <span className="text-[#EAFF00]/40">•</span>
                  <span className="hidden sm:inline">HBC 2026 ★</span>
                  <span className="sm:hidden">★</span>
                </div>
                
                <span className="text-sm sm:text-base font-black tracking-wider text-white uppercase group-hover:text-[#EAFF00] transition-colors font-sans flex items-center gap-1.5 drop-shadow-[2px_2px_0px_#581C87]">
                  BUY TICKETS
                </span>
              </div>
            </div>

            {/* Perforated Stub Divider with Top/Bottom Mini Cutout */}
            <div className="relative flex flex-col items-center justify-between self-stretch px-1">
              <div className="w-2.5 h-1.5 bg-black rounded-b-full -mt-2 border-b border-x border-[#EAFF00]" />
              <div className="w-[1px] h-full border-r border-dashed border-[#EAFF00]/60 my-0.5" />
              <div className="w-2.5 h-1.5 bg-black rounded-t-full -mb-2 border-t border-x border-[#EAFF00]" />
            </div>

            {/* Right Stub: Barcode & Entry Details */}
            <div className="flex flex-col items-center justify-center pl-1 pr-1 sm:pr-2">
              <span className="text-[8px] sm:text-[9px] font-mono font-extrabold tracking-widest text-[#EAFF00] uppercase">
                ENTRY
              </span>
              {/* Vintage Barcode */}
              <div className="flex gap-[1.5px] mt-1 items-center h-4 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="w-[1.5px] h-full bg-[#EAFF00]" />
                <span className="w-[2.5px] h-full bg-purple-400" />
                <span className="w-[1px] h-full bg-[#EAFF00]" />
                <span className="w-[3px] h-full bg-[#EAFF00]" />
                <span className="w-[1px] h-full bg-purple-400" />
                <span className="w-[2px] h-full bg-[#EAFF00]" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </a>
  );
}

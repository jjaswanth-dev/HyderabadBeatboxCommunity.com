"use client";

import { motion } from "framer-motion";
import { Mic, ArrowUpRight, Radio, ImageIcon } from "lucide-react";
import Section from "./Section";

export default function About() {
  const highlights = [
    "Weekly Park Cyphers",
    "Skill Workshops & Jams",
    "National Battles & Showcases",
  ];

  return (
    <Section id="about" className="py-20 md:py-32 relative overflow-hidden bg-black text-white w-full">
      {/* Brand Ambient Glows in Blue */}
      <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-[#0066FF]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[550px] h-[550px] bg-[#0066FF]/8 rounded-full blur-[180px] pointer-events-none" />

      {/* Full-width spread container across entire screen */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24 items-center">
          {/* Left Side: Large Prominent Full-Spread Photo Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 w-full"
          >
            <div className="relative w-full h-[420px] sm:h-[500px] md:h-[560px] lg:h-[620px] rounded-3xl border border-white/10 bg-gradient-to-br from-[#161616] via-[#101010] to-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center group hover:border-[#0066FF]/40 transition-all duration-300">
              {/* Direct Illustration Image filling container */}
              <img
                src="https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/IMG_8051.JPG.jpeg"
                alt="Hyderabad Beatbox Art"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Subtle dark gradient overlay for bottom bar readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Bottom tag bar */}
              <div className="absolute bottom-6 inset-x-6 sm:bottom-8 sm:inset-x-8 px-5 py-3 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md flex items-center justify-between text-xs sm:text-sm text-white/70">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#0066FF]" /> Hyderabad Beatbox Community
                </span>
                <span className="text-[#0066FF] font-mono font-bold">100% Vocal Art</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Clean, High-Impact, Minimal Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-7"
          >
            {/* Blue Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/30 text-xs font-bold text-[#0066FF] uppercase tracking-wider shadow-sm">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#0066FF]" />
              <span>WHO WE ARE</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight uppercase">
              Building the Beatbox Community in{" "}
              <span className="text-[#0066FF]">Hyderabad</span>
            </h2>

            {/* Concise Story Copy */}
            <div className="space-y-4 text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed">
              <p>
                Hyderabad Beatbox (HBX) is an open grassroots collective connecting vocal percussionists, battle contenders, and rhythm artists across the city.
              </p>
              <p>
                From casual weekend park cyphers to organizing major battle stages, we provide a welcoming home for artists of all levels to practice, exchange sounds, and represent the city.
              </p>
            </div>

            {/* Clean Highlight Badges */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#0066FF]/40 text-xs sm:text-sm text-white/80 font-medium transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Clean Action Button */}
            <div className="pt-4 flex items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 shadow-xl shadow-blue-500/25 active:scale-95"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="#events"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 active:scale-95"
              >
                <span>Events</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

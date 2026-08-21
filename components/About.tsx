"use client";

import { motion } from "framer-motion";
import { 
  Mic, 
  Users, 
  Trophy, 
  Radio, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  MapPin
} from "lucide-react";
import Section from "./Section";

export default function About() {
  const pillars = [
    {
      icon: <Users className="w-5 h-5 text-[#0066FF]" />,
      tag: "Community",
      title: "Weekly Cyphers & Jams",
      description: "Casual weekend meetups in parks and spots across Hyderabad to jam, trade beats, and vibe together.",
    },
    {
      icon: <Mic className="w-5 h-5 text-[#0066FF]" />,
      tag: "Skill Sharing",
      title: "Workshops & Mentorship",
      description: "From basic percussion and rhythm fundamentals to advanced sounds and routine structure.",
    },
    {
      icon: <Trophy className="w-5 h-5 text-[#0066FF]" />,
      tag: "Platform",
      title: "Battles & Showcases",
      description: "Giving local vocal artists the stage with community battles, video projects, and live performances.",
    },
  ];

  const stats = [
    { label: "Active Beatboxers", value: "30+" },
    { label: "Cyphers & Meetups", value: "Weekly" },
    { label: "Instruments Used", value: "0 (100% Vocal)" },
    { label: "Home Base", value: "Hyderabad" },
  ];

  return (
    <Section id="about" className="section-padding relative overflow-hidden bg-black">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#0066FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-width relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-xs md:text-sm font-medium text-[#0066FF] mb-4 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#0066FF]" />
            <span>WHO WE ARE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
          >
            Building the Beatbox Community in{" "}
            <span className="text-[#0066FF]">Hyderabad</span>
          </motion.h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Story Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 glass-effect rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl"
          >
            {/* Soft inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0066FF] bg-[#0066FF]/10 px-3 py-1.5 rounded-full border border-[#0066FF]/20">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Hyderabad, India</span>
                </div>
              </div>

              {/* Genuine Headline */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5 leading-snug">
                A grassroots space for beatboxers to connect, practice, and represent the city.
              </h3>

              {/* Natural, honest copy */}
              <div className="space-y-4 text-white/75 text-sm sm:text-base leading-relaxed">
                <p>
                  Hyderabad Beatbox (HBX) started as a small circle of beatboxers meeting up across the city to jam and share sounds. Today, we’re an open community of 30+ beatboxers of all skill levels — from people just learning basic percussion to artists competing on national stages.
                </p>
                <p>
                  Whether you want to learn your first beat pattern, polish your battle routines, or just hang out with fellow artists who love the artform, there&apos;s a spot for you in our cyphers.
                </p>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-left">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/50 font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3 Pillar Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="glass-effect rounded-2xl border border-white/10 p-5 sm:p-6 transition-all duration-300 hover:border-[#0066FF]/40 hover:bg-white/[0.03] shadow-lg relative group flex-1 flex flex-col justify-center"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {pillar.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-white truncate">
                        {pillar.title}
                      </h4>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-white/5 text-white/70 border-white/10">
                        {pillar.tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl glass-effect border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#0066FF]/10 via-black to-black"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/30 flex items-center justify-center text-[#0066FF] flex-shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Want to join a cypher or jam with us?</p>
              <p className="text-xs text-white/50">All beatboxers and vocal artists in Hyderabad are welcome.</p>
            </div>
          </div>

          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#0066FF]/20"
          >
            <span>Get in Touch</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </Section>
  );
}



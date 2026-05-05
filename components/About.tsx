"use client";

import { Mic, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import Section from "./Section";

export default function About() {
  return (
    <Section id="about" className="section-padding bg-black">
      <div className="container-width">
        <h2 className="section-title text-center">About Our Community</h2>
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {[
            {
              icon: <Mic className="w-8 h-8" />,
              title: "Beatboxers",
              description:
                "Learn from experienced beatboxers-join the community",
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Growing Community",
              description: "30+ active members and counting",
            },
            {
              icon: <Star className="w-8 h-8" />,
              title: "Regular Events",
              description: "Weekly meetups and workshops",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="card p-8 text-center hover-scale"
              whileHover={{ y: -10 }}
            >
              <div className="mb-6 text-[#0066FF] inline-block">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
              <p className="text-white/60">{item.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-white/80 leading-relaxed font-sans">
            Welcome to Hyderabad Beatbox! Get ready to vibe with the freshest
            beats from Hyderabad&apos;s top beatboxers. We&apos;re bringing you
            electrifying performances, killer tutorials, and collabs that push
            the limits. The Hyderabad Beatbox Community has grown into a vibrant
            collective of 30+ passionate artists, bringing together beatboxers
            from all corners of the city.
          </p>
        </div>
      </div>
    </Section>
  );
}

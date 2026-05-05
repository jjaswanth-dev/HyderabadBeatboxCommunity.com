"use client";

import { motion } from "framer-motion";

export default function OurClients() {
  const logos = [
    "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/hcl.png",
    "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/uber.png",
    "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/morgan.png",
    "https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/amazon.png",
  ];

  return (
    <section className="py-12 overflow-hidden bg-black/40 border-y border-white/5">
      <h2 className="text-center text-white/50 text-sm uppercase tracking-[0.3em] font-bold mb-8">
        Collaborated With
      </h2>
      <div className="relative flex overflow-x-hidden">
        {/* The duplicate containers ensure there is never any empty space */}
        <motion.div
          className="flex whitespace-nowrap gap-24 items-center py-4"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30, // Slower speed for better visibility
              ease: "linear",
            },
          }}
        >
          {/* Repeat logos 4 times to fill any screen width completely */}
          {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <img
                src={logo}
                alt="Client logo"
                className="h-8 md:h-12 w-auto object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

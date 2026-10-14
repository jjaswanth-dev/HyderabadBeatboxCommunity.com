"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode, useState, useEffect } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className = "", id = "" }: SectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Ensure content is immediately visible on mount or when inView triggers
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Immediate fallback: ensure visibility is triggered even if IntersectionObserver fails on mobile/iOS
    setMounted(true);
  }, []);

  const isVisible = inView || mounted;

  return (
    <motion.div
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

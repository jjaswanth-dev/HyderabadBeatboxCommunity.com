"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWildcardActive, setIsWildcardActive] = useState(false);
  const [isDraw24Active, setIsDraw24Active] = useState(true);
  const [isChampionshipActive, setIsChampionshipActive] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [wildcardRes, draw24Res, champRes] = await Promise.allSettled([
          fetch("/api/wildcard"),
          fetch("/api/draw-24"),
          fetch("/api/championship/public"),
        ]);
        
        if (wildcardRes.status === "fulfilled") {
          const wData = await wildcardRes.value.json();
          if (wData && wData.isActive) setIsWildcardActive(true);
        }

        if (draw24Res.status === "fulfilled") {
          const dData = await draw24Res.value.json();
          if (dData && dData.isActive) setIsDraw24Active(true);
        }

        if (champRes.status === "fulfilled") {
          const cData = await champRes.value.json();
          if (cData && cData.isActive) setIsChampionshipActive(true);
        }
      } catch (err) {
        console.error("Failed to check feature statuses", err);
      }
    };
    checkStatus();
  }, []);

  const sections = [
    "home",
    "about",
    ...(isChampionshipActive ? ["championship"] : []),
    ...(isDraw24Active ? ["draw-24"] : []),
    ...(isWildcardActive ? ["wildcard"] : []),
    "events",
    "gallery",
    "videos",
    "blog",
    "contact",
  ];

  const scrollToSection = (id: string) => {
    if (id === "championship") {
      window.location.href = "/championship";
      setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 300);
      return;
    }
    if (id === "draw-24") {
      window.location.href = "/draw-24";
      setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 300);
      return;
    }
    if (id === "wildcard") {
      window.location.href = "/wildcard";
      setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 300);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.location.href = `/#${id}`;
    }
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? "glass-effect" : "bg-transparent"
        }`}
    >
      <nav className="h-20 px-8 flex items-center justify-between">
        <Link href="/">
          <motion.img
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-12 cursor-pointer transition-transform hover:scale-102 duration-300"
            src="/HBX logoo.png"
            alt="Logo"
          />
        </Link>

        <div className="hidden lg:flex space-x-12 mr-11">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`nav-link ${
                section === "championship"
                  ? "animate-pulse-glow font-black text-emerald-400"
                  : section === "draw-24"
                  ? "animate-pulse-glow font-bold text-sky-400"
                  : section === "wildcard"
                  ? "animate-pulse-glow font-bold text-emerald-400"
                  : ""
              }`}
            >
              {section === "championship"
                ? "LIVE CHAMPIONSHIP"
                : section === "draw-24"
                ? "WILDCARD WINNERS"
                : section.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white/80 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-effect"
          >
            <div className="py-4 px-4 space-y-4">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left px-4 py-2 nav-link ${
                    section === "championship"
                      ? "animate-pulse-glow font-black text-emerald-400"
                      : section === "draw-24"
                      ? "animate-pulse-glow font-bold text-sky-400"
                      : section === "wildcard"
                      ? "animate-pulse-glow font-bold text-emerald-400"
                      : ""
                  }`}
                >
                  {section === "championship"
                    ? "LIVE CHAMPIONSHIP"
                    : section === "draw-24"
                    ? "WILDCARD WINNERS"
                    : section.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

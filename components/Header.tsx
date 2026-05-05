"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? "glass-effect" : "bg-transparent"
      }`}
    >
      <nav className="h-20 px-8 flex items-center justify-between">
        <motion.img
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-12"
          src="/HBX logoo.png"
          alt="Logo"
        />

        <div className="hidden lg:flex space-x-12 mr-11">
          {[
            "home",
            "about",
            "events",
            "gallery",
            "videos",
            "blog",
            "contact",
          ].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="nav-link"
            >
              {section.toUpperCase()}
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
              {[
                "home",
                "about",
                "events",
                "gallery",
                "videos",
                "blog",
                "contact",
              ].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left px-4 py-2 nav-link"
                >
                  {section.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

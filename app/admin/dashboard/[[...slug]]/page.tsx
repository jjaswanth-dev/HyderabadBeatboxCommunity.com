"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import EventsManager from "@/components/admin/EventsManager";
import GalleryManager from "@/components/admin/GalleryManager";
import VideosManager from "@/components/admin/VideosManager";
import HomeImageManager from "@/components/admin/HomeImageManager";
import BlogManager from "@/components/admin/BlogManager";

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  // Determine which manager to show based on pathname
  const getActiveManager = () => {
    if (pathname?.includes("/events")) return <EventsManager />;
    if (pathname?.includes("/gallery")) return <GalleryManager />;
    if (pathname?.includes("/videos")) return <VideosManager />;
    if (pathname?.includes("/home-images")) return <HomeImageManager />;
    if (pathname?.includes("/blogs")) return <BlogManager />;
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  const navItems = [
    { href: "/admin/dashboard/events", label: "Manage Events" },
    { href: "/admin/dashboard/gallery", label: "Manage Gallery" },
    { href: "/admin/dashboard/videos", label: "Manage Videos" },
    { href: "/admin/dashboard/home-images", label: "Manage Home Images" },
    { href: "/admin/dashboard/blogs", label: "Manage Blogs" },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://t3.ftcdn.net/jpg/10/23/94/68/360_F_1023946869_TID7KbKpSoPkS0TG8wQHeWH0QwNJBAGo.jpg')",
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-50 backdrop-blur-lg">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="glass-effect border-b border-white/10 p-4 shadow-lg"
        >
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold tracking-wider">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.nav>

        <div className="container mx-auto p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
          >
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <motion.div
                  variants={itemVariants}
                  className={`glass-effect p-6 rounded-xl text-center hover:bg-white/5 transition-all cursor-pointer shadow-lg border border-white/10 ${
                    pathname === item.href ? "border-blue-500 bg-blue-500/10" : ""
                  }`}
                >
                  <h2 className="text-xl text-white font-semibold">{item.label}</h2>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {getActiveManager()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

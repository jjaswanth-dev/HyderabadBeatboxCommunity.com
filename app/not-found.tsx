import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found | Hyderabad Beatbox Community",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Background image container (ready for your custom image & link later) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{
          // You can drop your background image here later:
          // backgroundImage: "url('/your-background.jpg')",
          backgroundImage: "url('https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/Notfouund_11zon.jpg')",

        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/40 mb-2">
          Error 404
        </span>
        <h1 className="text-7xl md:text-9xl font-extrabold tracking-tight text-white mb-3">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
          The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-white text-black hover:bg-neutral-200 font-semibold rounded-full text-sm transition-all duration-200 shadow-lg hover:scale-105"
        >
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}

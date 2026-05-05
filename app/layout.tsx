import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Hyderabad Beatbox Community",
  description: "Uniting rhythms, creating beats, building community. The official website of the Hyderabad Beatbox Community.",
  keywords: ["beatbox", "hyderabad", "community", "music", "beatboxing"],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Hyderabad Beatbox Community",
    description: "Uniting rhythms, creating beats, building community",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable}`}>
      <body className={`${lexend.className} min-h-screen bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}

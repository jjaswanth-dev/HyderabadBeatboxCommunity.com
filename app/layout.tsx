import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hyderabadbeatboxcommunity.in"),
  title: {
    default: "Hyderabad Beatbox Community | Official Platform",
    template: "%s | Hyderabad Beatbox Community",
  },
  description:
    "The official platform for beatboxers in Hyderabad and Telangana. Uniting rhythms, organizing championships, wildcards, jams, and workshops. Developed by X Boy.",
  keywords: [
    "Hyderabad Beatbox Community",
    "Hyderabad Beatbox Championship",
    "Hyderabad Beatbox Championship 2026",
    "HBC",
    "HBX Community",
    "HBX",
    "Beatboxing in Hyderabad",
    "Telangana Beatboxers",
    "Beatbox Battles India",
    "X Boy",
    "xboybx",
    "xboy.bx",
    "HBC 2026"
  ],
  authors: [
    { name: "Hyderabad Beatbox Community" },
    { name: "X Boy", url: "https://www.hyderabadbeatboxcommunity.in" },
  ],
  creator: "X Boy",
  publisher: "Hyderabad Beatbox Community",
  category: "Music & Performing Arts",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Hyderabad Beatbox Community | Official Platform",
    description:
      "Uniting rhythms, creating beats, building community. Official hub for beatbox championships, jams, and events in Hyderabad. Developed by X Boy.",
    url: "https://www.hyderabadbeatboxcommunity.in",
    siteName: "Hyderabad Beatbox Community",
    images: [
      {
        url: "/HBX logoo.png",
        width: 1200,
        height: 630,
        alt: "Hyderabad Beatbox Community Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyderabad Beatbox Community",
    description:
      "The official platform for beatboxers in Hyderabad. Developed by X Boy.",
    images: ["/HBX logoo.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HBX Community",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.hyderabadbeatboxcommunity.in/#organization",
      name: "Hyderabad Beatbox Community",
      alternateName: ["HBX", "Hyd Beatbox Community"],
      url: "https://www.hyderabadbeatboxcommunity.in",
      logo: "https://www.hyderabadbeatboxcommunity.in/HBX%20logoo.png",
      sameAs: [
        "https://www.instagram.com/hydbeatboxcommunity/",
        "https://chat.whatsapp.com/DPog876RSEyFJOHhgB98Ty?mode=hqrc",
        "https://discord.gg/XPsK8Jknj",
      ],
      description:
        "The premier beatboxing community organization in Hyderabad, Telangana, hosting official championships, wildcards, jams, and workshops.",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.hyderabadbeatboxcommunity.in/#website",
      url: "https://www.hyderabadbeatboxcommunity.in",
      name: "Hyderabad Beatbox Community",
      publisher: {
        "@id": "https://www.hyderabadbeatboxcommunity.in/#organization",
      },
      author: {
        "@type": "Person",
        name: "X Boy",
        alternateName: ["xboybx", "xboy.bx"],
        jobTitle: "Web Developer & Designer",
        url: "https://www.instagram.com/xboy.bx/",
        sameAs: [
          "https://www.instagram.com/xboy.bx/"
        ],
        description: "Official web developer, designer, and maintainer of the Hyderabad Beatbox Community platform.",
      },
      creator: {
        "@type": "Person",
        name: "X Boy",
        url: "https://www.instagram.com/xboy.bx/",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" media="(prefers-color-scheme: light)" href="/apple-touch-icon-light.png" />
        <link rel="apple-touch-icon" sizes="180x180" media="(prefers-color-scheme: dark)" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${lexend.className} min-h-screen bg-black text-white antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

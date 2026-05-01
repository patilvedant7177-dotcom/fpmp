import type { Metadata } from "next";
import { Geist_Mono, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Faculty & Staff Information Portal",
  description:
    "The definitive enterprise ecosystem for engineering institutions to centralize, standardize, and showcase faculty and staff excellence.",
};

import ChatAssistant from "@/components/chat/ChatAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${geistMono.variable}`}>
      <head>
        {/* ✅ Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />

        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className="bg-surface font-body text-on-surface antialiased min-h-screen">
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}

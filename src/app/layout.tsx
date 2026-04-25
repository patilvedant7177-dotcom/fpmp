import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope, Public_Sans } from "next/font/google";
import "./globals.css";
 
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FPMP | Faculty Profile Management Platform",
  description:
    "Enterprise ecosystem for engineering institutions to centralize and showcase faculty excellence.",
};

import ChatAssistant from "@/components/chat/ChatAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${publicSans.variable} ${inter.variable} ${geistMono.variable}`}>
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

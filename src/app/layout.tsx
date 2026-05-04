import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "LUATH.EXE // MEDIA_DOWNLOADER",
  description: "HIGH_SPEED_MEDIA_EXTRACTION_SYSTEM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${spaceGrotesk.variable} ${robotoMono.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0A0A] text-white antialiased min-h-screen flex flex-col`}>
        {/* Dot Matrix Background */}
        <div className="fixed inset-0 z-0 bg-dot-grid opacity-30 pointer-events-none"></div>

        <Header />

        {children}

        <footer className="bg-[#0A0A0A] dark:bg-[#0A0A0A] border-t border-[#262626] z-50 w-full mt-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 gap-4 w-full max-w-[1440px] mx-auto">
            <div className="text-sm font-bold text-white uppercase font-headline-md">
              © 2026 LUATH // [ STATUS: OPERATIONAL ]
            </div>
            <nav className="flex flex-wrap justify-center gap-6 font-headline-md text-[10px] uppercase tracking-tighter">
              <a className="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">GITHUB</a>
              <a className="text-gray-600 hover:text-white transition-colors cursor-pointer" href="/dashboard">DASHBOARD</a>
              <a className="text-gray-600 hover:text-white transition-colors cursor-pointer" href="/privacy">PRIVACY</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

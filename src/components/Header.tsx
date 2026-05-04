"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#0A0A0A] dark:bg-[#0A0A0A] border-b border-[#262626] z-50 sticky top-0 w-full">
      <div className="flex justify-between items-center h-14 px-4 md:px-6 w-full max-w-[1440px] mx-auto">
        <div className="text-lg md:text-xl font-black text-white border-r border-[#262626] pr-4 flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <span className="font-headline-md text-headline-md tracking-tighter">LUATH.EXE</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 font-headline-md uppercase tracking-widest text-sm">
          <Link href="/" className="text-gray-500 hover:bg-white hover:text-black transition-all duration-75 px-2 py-1 active:opacity-80">HOME</Link>
          <Link href="/history" className="text-gray-500 hover:bg-white hover:text-black transition-all duration-75 px-2 py-1 active:opacity-80">HISTORY</Link>
          <Link href="/privacy" className="text-gray-500 hover:bg-white hover:text-black transition-all duration-75 px-2 py-1 active:opacity-80">PRIVACY</Link>
          <Link href="/donate" className="text-gray-500 hover:bg-white hover:text-black transition-all duration-75 px-2 py-1 active:opacity-80">DONATE</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden lg:block font-headline-md uppercase tracking-widest text-sm text-gray-500 hover:bg-white hover:text-black transition-all duration-75 px-4 py-1 border border-[#262626] active:opacity-80 cursor-pointer">
            DASHBOARD
          </Link>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 p-1 border border-[#262626] hover:bg-white hover:text-black transition-colors"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-[#262626] shadow-2xl z-50">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-headline-md uppercase tracking-widest text-gray-500 hover:bg-white hover:text-black transition-colors border-b border-[#1A1A1A]"
                >
                  HOME
                </Link>
                <Link
                  href="/history"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-headline-md uppercase tracking-widest text-gray-500 hover:bg-white hover:text-black transition-colors border-b border-[#1A1A1A]"
                >
                  HISTORY
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-headline-md uppercase tracking-widest text-gray-500 hover:bg-white hover:text-black transition-colors border-b border-[#1A1A1A]"
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-headline-md uppercase tracking-widest text-gray-500 hover:bg-white hover:text-black transition-colors border-b border-[#1A1A1A]"
                >
                  PRIVACY
                </Link>
                <Link
                  href="/donate"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-headline-md uppercase tracking-widest text-gray-500 hover:bg-white hover:text-black transition-colors"
                >
                  DONATE
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

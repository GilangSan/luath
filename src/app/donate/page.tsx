"use client";

import { useState, useEffect, useRef } from "react";

export default function DonatePage() {
  const [isQrLoading, setIsQrLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsQrLoading(false);
    }
  }, []);

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-12 z-10 relative flex flex-col gap-8">
      {/* System Console Header */}
      <div className="mb-4 border-l-4 border-primary pl-4 py-2">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-headline-lg flex items-center tracking-tight break-words">
          <span className="opacity-50 mr-2 shrink-0">&gt;</span>
          <span className="truncate">EXECUTE: SUPPORT_PROTOCOL.SH</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-label-caps text-outline">
          <span>[ SESSION: ACTIVE ]</span>
          <span>[ TARGET: SAWERIA_GATEWAY ]</span>
          <span>[ STATUS: READY_FOR_INJECTION ]</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Description */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border border-outline-variant/30 p-6 bg-surface-container-lowest/50 backdrop-blur-sm">
            <div className="font-label-caps text-label-caps text-secondary mb-4">[ SYSTEM_MAINTENANCE_LOG ]</div>
            <p className="font-code-lg text-code-lg text-on-surface-variant leading-relaxed">
              To maintain high-speed extraction clusters and bypass platform throttling, direct resource allocation is required.
              Your contribution directly fuels the development of new extraction modules and infrastructure scaling.
            </p>
            <div className="mt-8 pt-6 border-t border-dotted border-outline-variant/50">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest">Secure Transmission via Saweria</span>
              </div>
              <a
                href="https://saweria.co/isntlang"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-primary text-surface px-8 py-4 font-label-caps text-label-caps font-bold hover:bg-white transition-all group cursor-pointer shadow-[4px_4px_0px_#262626]"
              >
                INITIALIZE_SAWERIA_TX
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-outline-variant/20 p-4 bg-surface-container-lowest/30">
              <div className="text-[10px] text-outline font-label-caps mb-1">01_UPTIME</div>
              <div className="text-xs text-primary font-mono font-bold">99.9% UPTIME</div>
            </div>
            <div className="border border-outline-variant/20 p-4 bg-surface-container-lowest/30">
              <div className="text-[10px] text-outline font-label-caps mb-1">02_CLUSTERS</div>
              <div className="text-xs text-primary font-mono font-bold">12_NODES_ACTIVE</div>
            </div>
            <div className="border border-outline-variant/20 p-4 bg-surface-container-lowest/30">
              <div className="text-[10px] text-outline font-label-caps mb-1">03_BANDWIDTH</div>
              <div className="text-xs text-primary font-mono font-bold">UNLIMITED_EXTRACTION</div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[440px] aspect-square bg-surface-container-lowest shadow-[8px_8px_0px_rgba(var(--primary-rgb),0.1)] border border-outline-variant/30 flex flex-col">
            <div className="bg-surface-container text-on-surface-variant px-4 py-2 font-label-caps text-xs font-bold flex justify-between items-center border-b border-outline-variant/30 ">
              <span>SCAN_FOR_INJECTION</span>
              <span className="material-symbols-outlined text-sm">qr_code_2</span>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-6">
              <div className="relative group w-full max-w-[280px] aspect-square flex items-center justify-center">
                {isQrLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-pulse border border-outline-variant/30 bg-surface-container-low">
                    <span className="material-symbols-outlined text-4xl text-primary opacity-50">memory</span>
                    <span className="font-label-caps text-[10px] text-outline uppercase tracking-widest">FETCHING_GATEWAY_QR...</span>
                  </div>
                )}
                <img
                  ref={imgRef}
                  src="/saweria_qr.png"
                  alt="Saweria QR Code"
                  onLoad={() => setIsQrLoading(false)}
                  className={`w-full h-full object-contain p-2 border border-outline-variant/30 transition-opacity duration-700 ${isQrLoading ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
              <div className="text-center font-mono text-[10px] text-outline leading-tight uppercase">
                &gt; Point neural interface (camera) to initialize transmission<br />
                &gt; Protocol: SAW-GATE-04
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Decorator */}
      <div className="mt-8 border border-outline-variant/30 bg-surface-container-lowest/20 p-4 text-[10px] font-mono leading-relaxed text-outline/50">
        <div>[SYSTEM] Support channel established...</div>
        <div>[SYSTEM] Handshake with SAWERIA_API successful.</div>
        <div>[SYSTEM] Awaiting user authorization.</div>
      </div>
    </main>
  );
}

"use client";

import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-12 z-10 relative flex flex-col gap-8">
      {/* System Console Header */}
      <div className="mb-4 border-l-4 border-primary pl-4 py-2">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-headline-lg flex items-center tracking-tight break-words">
          <span className="opacity-50 mr-2 shrink-0">&gt;</span> 
          <span className="truncate">EXECUTE: VIEW_PRIVACY_POLICY.SH</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-label-caps text-outline">
          <span>[ STATUS: READ_ONLY ]</span>
          <span>[ LAST_MODIFIED: 2026.05.04 ]</span>
          <span>[ VER: 1.0.0 ]</span>
        </div>
      </div>

      <div className="border border-outline-variant/30 bg-surface-container-lowest/50 p-6 md:p-10 backdrop-blur-sm">
        <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-on-surface-variant space-y-8">
          
          <section>
            <div className="text-primary font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">security</span>
              <span>[ 00_OVERVIEW ]</span>
            </div>
            <p>
              Welcome to LUATH ("we", "our", or "us"). This Privacy Policy explains how we handle information when you use our video downloading service available at our website (the "Service"). We are committed to protecting your privacy and being transparent about our practices.
              By using LUATH, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">visibility_off</span>
              <span>[ 01_DATA_NON_COLLECTION ]</span>
            </div>
            <p>LUATH is designed with privacy in mind. We do not require account registration and do not collect:</p>
            <ul className="list-disc pl-6 space-y-1 opacity-80">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Account credentials or login data</li>
              <li>Payment information</li>
              <li>User profiles or persistent identifiers tied to individuals</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">memory</span>
              <span>[ 02_DATA_PROCESSING_IN_MEMORY ]</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-1">2.1 URLs You Submit</h3>
                <p className="opacity-80">When you submit a URL for downloading, that URL is sent to our server to be processed by our backend service. The URL is used solely to fetch and deliver the requested media file. We do not store submitted URLs in any persistent database after the download job is completed.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">2.2 Download Job Data (Temporary)</h3>
                <p className="opacity-80">To facilitate downloads, we temporarily store job-related data in server memory, including the submitted URL, download status, progress, filename, and file size. This data is stored in-memory only and is automatically purged after a short period post-completion.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">2.3 Aggregate Statistics (In-Memory)</h3>
                <p className="opacity-80">Our status page may display aggregate, non-personal statistics about recent downloads. This data is kept in server memory, is not tied to any individual user, and resets when the server restarts.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">2.4 Server Logs</h3>
                <p className="opacity-80">Like most web services, our server may automatically log standard technical data including IP addresses (for rate limiting and abuse prevention), HTTP request methods, and timestamps. Server logs are retained for a limited period for operational and security purposes.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">storage</span>
              <span>[ 03_LOCAL_PERSISTENCE ]</span>
            </div>
            <p>
              LUATH does not use tracking cookies or third-party analytics cookies. Your download history, if displayed in the browser interface, is stored entirely in your browser's <span className="text-primary">localStorage</span> — meaning it stays on your device and is never transmitted to our servers. You can clear this data at any time by clearing your browser's local storage.
            </p>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>[ 04_USAGE_PROTOCOL ]</span>
            </div>
            <p>Any information processed by LUATH is used solely to:</p>
            <ul className="list-disc pl-6 space-y-1 opacity-80">
              <li>Deliver the media file you requested</li>
              <li>Monitor and maintain service performance and availability</li>
              <li>Detect and prevent abuse, spam, or excessive usage (rate limiting)</li>
              <li>Display aggregate, anonymized statistics on our public status page</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">api</span>
              <span>[ 05_THIRD_PARTY_INTERFACES ]</span>
            </div>
            <p>
              LUATH uses yt-dlp, an open-source tool, to extract and download media from third-party platforms (such as YouTube, TikTok, Instagram, and others). When you submit a URL, our server interacts with those third-party platforms on your behalf.
              We are not responsible for the privacy practices of those third-party platforms.
            </p>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">share_reviews</span>
              <span>[ 06_DATA_SHARING_DISCLOSURE ]</span>
            </div>
            <p>We do not sell, trade, or rent any user data. We may disclose information only to comply with applicable laws, to protect the rights and safety of the Service, or in connection with a merger or acquisition.</p>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">history</span>
              <span>[ 07_RETENTION_CYCLES ]</span>
            </div>
            <ul className="list-disc pl-6 space-y-1 opacity-80">
              <li>Download job data is deleted from server memory automatically after completion.</li>
              <li>Aggregate statistics reset when the server restarts.</li>
              <li>Browser-side history (localStorage) is retained on your device until you clear it.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">policy</span>
              <span>[ 12_LEGAL_DISCLAIMER ]</span>
            </div>
            <p className="border-l-2 border-primary/30 pl-4 py-2 italic opacity-90 bg-primary/5">
              LUATH is a tool that facilitates downloading publicly accessible media. Users are solely responsible for ensuring their use of the Service complies with applicable copyright laws and the Terms of Service of the source platforms. LUATH does not host, store, or distribute third-party copyrighted content.
            </p>
          </section>

          <div className="pt-12 border-t border-outline-variant/30 text-center opacity-40 text-[10px] uppercase tracking-[0.2em]">
            &lt; END_OF_TRANSMISSION // LUATH_SECURITY_ENFORCEMENT &gt;
          </div>
        </div>
      </div>
    </main>
  );
}

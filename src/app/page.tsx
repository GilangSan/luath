"use client";

import { useState, useEffect } from "react";
import { useDownload } from "@/hooks/useDownload";
import ErrorDisplay from "@/components/ErrorDisplay";
import {
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
  TwitterXIcon,
  FacebookIcon,
  RedditIcon
} from "@/components/SocialIcons";
import { getFileUrl } from "@/lib/api";

// Helper functions
const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "N/A";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDuration = (seconds: number | null) => {
  if (seconds === null) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

const formatViews = (views: number | null) => {
  if (views === null) return "N/A";
  if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
  if (views >= 1000) return (views / 1000).toFixed(1) + "K";
  return views.toString();
};

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const {
    stage,
    metadata,
    progress,
    error,
    selectedStream,
    jobId,
    extract,
    startDownload,
    reset,
    dismissDownload,
  } = useDownload();

  const [imgError, setImgError] = useState(false);
  const [activeStreamTab, setActiveStreamTab] = useState<"video" | "audio">("video");

  // Reset image error state when metadata changes
  useEffect(() => {
    setImgError(false);
  }, [metadata]);

  const handleReset = () => {
    setUrlInput("");
    reset();
  };

  const handleExecute = () => {
    if (!urlInput) return;
    extract(urlInput);
  };

  const getStatusText = () => {
    switch (stage) {
      case "idle": return "WAITING_FOR_URI";
      case "extracting": return "EXTRACTING_DATA";
      case "extracted": return "EXTRACTION_COMPLETE";
      case "downloading": return "DOWNLOAD_IN_PROGRESS";
      case "completed": return "JOB_SUCCESSFUL";
      case "failed": return "ERROR_OCCURRED";
      default: return "SYSTEM_READY";
    }
  };

  return (
    <main className="relative z-10 flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
      {/* System Console Header */}
      <div className="mb-4 border-l-4 border-primary pl-4 py-2">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-headline-lg flex items-center tracking-tight break-words">
          <span className="opacity-50 mr-2 shrink-0">&gt;</span>
          <span className="truncate">EXECUTE: MEDIA_EXTRACTION.SH</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-label-caps text-outline">
          <span>[ SESSION: ACTIVE ]</span>
          <span>[ TARGET: {metadata ? "CONNECTED" : "AWAITING_INPUT"} ]</span>
          <span>[ STAGE: {getStatusText()} ]</span>
        </div>
      </div>

      {/* Command Input Section */}
      <section className="flex flex-col gap-2">
        <div className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[16px]">keyboard_command_key</span>
          <span>SYSTEM_INPUT // {getStatusText()}</span>
        </div>

        <div className="border border-outline-variant bg-surface-container-lowest flex flex-col group focus-within:border-primary transition-colors">
          <div className="bg-surface-container border-b border-outline-variant p-2 flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant">/usr/bin/extract-core</span>
            <span className="flex gap-1.5">
              <button onClick={handleReset} className="text-[10px] text-secondary hover:text-primary transition-colors cursor-pointer uppercase font-bold">[ RESET_SYSTEM ]</button>
            </span>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-grow w-full">
              <span className="text-primary font-bold">&gt;_</span>
              <input
                type="text"
                placeholder="ENTER TARGET URL..."
                className="flex-grow bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none focus:ring-0 py-2 font-code-lg text-code-lg text-primary placeholder-on-surface-variant transition-colors"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExecute()}
                disabled={stage === "extracting" || stage === "downloading"}
              />
            </div>
            <button
              onClick={handleExecute}
              disabled={stage === "extracting" || stage === "downloading"}
              className={`w-full md:w-auto border border-outline-variant px-8 py-3 font-label-caps text-label-caps bg-surface hover:bg-primary hover:text-surface transition-all duration-150 flex justify-center items-center gap-2 group-focus-within:border-primary ${(stage === "extracting" || stage === "downloading") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">chip_extraction</span>
              EXECUTE
            </button>
          </div>
        </div>

        {/* Supported Platforms Section */}
        {stage === "idle" && !metadata && (
          <div className="mt-4 flex flex-col gap-3 animate-fade-in delay-200">
            <div className="font-label-caps text-[10px] text-on-surface-variant/40 flex items-center gap-2">
              <span className="w-8 h-px bg-outline-variant/30"></span>
              <span>SUPPORTED_PROTOCOLS</span>
              <span className="w-24 h-px bg-outline-variant/30"></span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 py-2">
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-[#FF0000] transition-colors">
                  <YouTubeIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">YOUTUBE</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-[#00F2EA] transition-colors">
                  <TikTokIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">TIKTOK</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-[#E4405F] transition-colors">
                  <InstagramIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">INSTAGRAM</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-white transition-colors">
                  <TwitterXIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">TWITTER_X</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-[#1877F2] transition-colors">
                  <FacebookIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">FACEBOOK</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="text-white group-hover:text-[#FF4500] transition-colors">
                  <RedditIcon />
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.2em]">REDDIT</span>
              </div>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        {stage === "idle" && !metadata && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 animate-fade-in">
            <div className="border border-outline-variant/30 p-4 bg-surface-container-lowest/50">
              <div className="text-[10px] text-secondary font-label-caps mb-1">[ 01_SOURCE ]</div>
              <p className="text-xs text-on-surface-variant font-mono">Copy media URL from YouTube, Instagram, or TikTok.</p>
            </div>
            <div className="border border-outline-variant/30 p-4 bg-surface-container-lowest/50">
              <div className="text-[10px] text-secondary font-label-caps mb-1">[ 02_INPUT ]</div>
              <p className="text-xs text-on-surface-variant font-mono">Paste URL into the console input field above.</p>
            </div>
            <div className="border border-outline-variant/30 p-4 bg-surface-container-lowest/50">
              <div className="text-[10px] text-secondary font-label-caps mb-1">[ 03_EXTRACT ]</div>
              <p className="text-xs text-on-surface-variant font-mono">Hit EXECUTE to initiate the extraction protocol.</p>
            </div>
            <div className="border border-outline-variant/30 p-4 bg-surface-container-lowest/50">
              <div className="text-[10px] text-secondary font-label-caps mb-1">[ 04_DOWNLOAD ]</div>
              <p className="text-xs text-on-surface-variant font-mono">Select quality and save media to local storage.</p>
            </div>
          </div>
        )}
      </section>

      {/* Loading & Progress & Success State Overlay */}
      {(stage === "extracting" || stage === "downloading" || stage === "completed") && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-fade-in">
          <section className="w-full max-w-2xl flex flex-col gap-4 animate-slide-up">
            <div className={`font-label-caps text-label-caps flex items-center gap-2 ${stage === "completed" ? "text-primary" : "text-secondary"}`}>
              <span className={`material-symbols-outlined text-[16px] ${stage === "completed" ? "" : "animate-spin"}`}>
                {stage === "completed" ? "check_circle" : "sync"}
              </span>
              <span className="blinking-cursor">
                {stage === "extracting" ? "EXTRACTING_METADATA" : stage === "downloading" ? "DOWNLOAD_IN_PROGRESS" : "DOWNLOAD_READY"} // {stage === "completed" ? "SUCCESS" : "PLEASE_WAIT"}
              </span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-8 md:p-12 flex flex-col items-center justify-center gap-6 shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)]">
              {stage === "completed" ? (
                <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
                  <span className="material-symbols-outlined text-7xl text-primary animate-pulse">task_alt</span>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="font-headline-sm text-primary uppercase tracking-widest">TRANSMISSION_COMPLETE</h3>
                    <p className="text-xs text-on-surface-variant font-code-sm opacity-60 max-w-xs">
                      The media package has been prepared. If your browser did not initiate the download automatically, use the manual link below.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
                    <a
                      href={jobId ? getFileUrl(jobId) : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-primary bg-primary text-surface py-3 font-label-caps text-center hover:bg-transparent hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      MANUAL_DOWNLOAD
                    </a>
                    <button
                      onClick={dismissDownload}
                      className="flex-1 border border-outline-variant bg-surface py-3 font-label-caps text-center hover:bg-surface-container transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer"
                    >
                      CLOSE_TERMINAL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-5xl text-secondary animate-spin">
                    {stage === "extracting" ? "settings" : "downloading"}
                  </span>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="font-code-sm text-secondary uppercase tracking-widest">
                      {stage === "extracting" ? "QUERYING_REMOTE_SERVER..." : `SYNCING_PACKETS... ${Math.round(progress)}%`}
                    </p>
                    {stage === "downloading" && (
                      <span className="text-[10px] text-on-surface-variant font-code-sm opacity-60">
                        DO NOT CLOSE TERMINAL // SESSION_ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="w-full max-w-md h-1 bg-surface-container overflow-hidden">
                    <div
                      className={`h-full bg-primary transition-all duration-300 ${stage === "extracting" ? "w-1/3 animate-[pulse_1s_ease-in-out_infinite]" : ""}`}
                      style={stage === "downloading" ? { width: `${progress}%` } : {}}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Error State */}
      {stage === "failed" && error && (
        <section className="animate-fade-in max-w-2xl mx-auto w-full">
          <ErrorDisplay
            error={error}
            onRetry={error.retryable ? (metadata && selectedStream ? () => startDownload(selectedStream.stream_id) : handleExecute) : undefined}
            onDismiss={reset}
          />
        </section>
      )}

      {/* Extraction Result Section */}
      {metadata && (stage === "extracted" || stage === "downloading" || stage === "completed") && (
        <section className="flex flex-col gap-4 animate-slide-up">
          <div className="font-label-caps text-label-caps text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="blinking-cursor">EXTRACTION_COMPLETE // STATUS_OK</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Metadata Card */}
            <div className="lg:col-span-5 border border-outline-variant bg-surface-container-lowest flex flex-col h-full">
              <div className="bg-surface-container border-b border-outline-variant p-2 font-label-caps text-label-caps text-on-surface-variant flex justify-between">
                <span>[ TARGET_METADATA ]</span>
                <span className="text-secondary">SOURCE: {metadata.source.toUpperCase()}</span>
              </div>
              <div className="p-6 flex flex-col gap-6 flex-grow">
                {/* Thumbnail */}
                <div className="relative w-full aspect-video border border-outline-variant overflow-hidden group bg-surface-container">
                  {metadata.thumbnail && !imgError ? (
                    <>
                      <img
                        src={metadata.thumbnail}
                        className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        alt={metadata.title}
                        onError={() => setImgError(true)}
                      />
                      {/* Download Button */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(metadata.thumbnail!);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              // Use title for filename, fallback to thumbnail
                              const safeTitle = metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
                              a.download = `thumbnail_${safeTitle || 'image'}.jpg`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (err) {
                              window.open(metadata.thumbnail!, '_blank');
                            }
                          }}
                          className="bg-surface/60 backdrop-blur-md border border-outline-variant px-3 py-1.5 font-label-caps text-[10px] text-primary hover:bg-primary hover:text-surface transition-all flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          DOWNLOAD_THUMBNAIL
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-10">visibility_off</span>
                      <span className="font-label-caps text-[9px] opacity-30 tracking-[0.2em]">NO_VISUAL_DATA_AVAILABLE</span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full border-[1px] border-white/10 pointer-events-none"></div>

                  {/* Duration Card with Backdrop Blur */}
                  <div className="absolute bottom-3 right-3 bg-surface/60 backdrop-blur-md border border-outline-variant px-3 py-1.5 font-label-caps text-label-caps text-primary flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {formatDuration(metadata.duration)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-headline-md text-headline-md text-primary leading-tight line-clamp-2">
                    {metadata.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {metadata.channel && <span className="border border-outline-variant px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">AUTHOR: {metadata.channel.toUpperCase()}</span>}
                    {metadata.views !== null && <span className="border border-outline-variant px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">VIEWS: {formatViews(metadata.views)}</span>}
                    {metadata.fps && <span className="border border-outline-variant px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">FPS: {metadata.fps}</span>}
                  </div>
                  {metadata.description && (
                    <p className="font-code-sm text-code-sm text-on-surface-variant mt-2 line-clamp-3 opacity-80">
                      {metadata.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Streams Card */}
            <div className="lg:col-span-7 border border-outline-variant bg-surface-container-lowest flex flex-col h-full">
              <div className="bg-surface-container border-b border-outline-variant p-2 font-label-caps text-label-caps text-on-surface-variant flex justify-between">
                <span>[ AVAILABLE_STREAMS ]</span>
                <span className="text-primary flex items-center gap-1">
                  {metadata.streams.length} STREAMS FOUND
                </span>
              </div>
              <div className="flex flex-col w-full overflow-y-auto max-h-[600px]">
                {/* Tab Switcher */}
                <div className="flex border-b border-outline-variant bg-surface-container-low">
                  <button
                    onClick={() => setActiveStreamTab("video")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-caps text-label-caps transition-all border-r border-outline-variant cursor-pointer ${activeStreamTab === "video"
                      ? "bg-white text-black shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]"
                      : "text-on-surface-variant hover:bg-surface-container transition-colors"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">movie</span>
                    VIDEO_PROTOCOLS
                  </button>
                  <button
                    onClick={() => setActiveStreamTab("audio")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-caps text-label-caps transition-all cursor-pointer ${activeStreamTab === "audio"
                      ? "bg-white text-black shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]"
                      : "text-on-surface-variant hover:bg-surface-container transition-colors"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">audio_file</span>
                    AUDIO_PROTOCOLS
                  </button>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest sticky top-0 z-10">
                  <div className="col-span-2">FORMAT</div>
                  <div className="col-span-4">QUALITY_METRICS</div>
                  <div className="col-span-3">EST_SIZE</div>
                  <div className="col-span-3 text-right">ACTION</div>
                </div>

                {/* Stream Rows */}
                {activeStreamTab === "video" ? (
                  metadata.streams.filter(s => s.type !== "audio").length > 0 ? (
                    metadata.streams
                      .filter(s => s.type !== "audio")
                      .sort((a, b) => {
                        // Priority for mp4
                        if (a.format.toLowerCase() === "mp4" && b.format.toLowerCase() !== "mp4") return -1;
                        if (a.format.toLowerCase() !== "mp4" && b.format.toLowerCase() === "mp4") return 1;
                        return 0;
                      })
                      .map((stream) => (
                        <div
                          key={stream.stream_id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 items-center border-b border-outline-variant hover:bg-surface-container transition-colors group animate-fade-in"
                        >
                          <div className="col-span-12 md:col-span-2 font-label-caps text-label-caps text-primary flex items-center gap-1 uppercase">
                            <span className="material-symbols-outlined text-[16px]">movie</span>
                            {stream.format}
                          </div>
                          <div className="col-span-6 md:col-span-4 flex flex-col">
                            <span className="text-primary font-bold">{stream.quality}</span>
                            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                              {stream.type === "merged" ? "VIDEO + AUDIO" : stream.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="col-span-6 md:col-span-3 font-code-sm text-code-sm text-on-surface-variant group-hover:text-primary transition-colors text-right md:text-left">
                            {formatBytes(stream.est_size_bytes)}
                          </div>
                          <div className="col-span-12 md:col-span-3 flex justify-end mt-2 md:mt-0">
                            <button
                              onClick={() => startDownload(stream.stream_id)}
                              disabled={stage === "downloading"}
                              className={`w-full md:w-auto border border-outline-variant px-4 py-2 font-label-caps text-label-caps transition-colors flex items-center justify-center md:justify-start gap-2 ${stage === "downloading" ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-surface cursor-pointer"
                                }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span> DL
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-12 text-center text-outline uppercase tracking-widest opacity-30 text-xs">NO_VIDEO_DATA_AVAILABLE</div>
                  )
                ) : (
                  metadata.streams.filter(s => s.type === "audio").length > 0 ? (
                    metadata.streams.filter(s => s.type === "audio").map((stream) => (
                      <div
                        key={stream.stream_id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 items-center border-b border-outline-variant hover:bg-surface-container transition-colors group animate-fade-in"
                      >
                        <div className="col-span-12 md:col-span-2 font-label-caps text-label-caps text-secondary flex items-center gap-1 uppercase">
                          <span className="material-symbols-outlined text-[16px]">audio_file</span>
                          {stream.format}
                        </div>
                        <div className="col-span-6 md:col-span-4 flex flex-col">
                          <span className="text-secondary font-bold">{stream.quality}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                            AUDIO ONLY
                          </span>
                        </div>
                        <div className="col-span-6 md:col-span-3 font-code-sm text-code-sm text-on-surface-variant group-hover:text-secondary transition-colors text-right md:text-left">
                          {formatBytes(stream.est_size_bytes)}
                        </div>
                        <div className="col-span-12 md:col-span-3 flex justify-end mt-2 md:mt-0">
                          <button
                            onClick={() => startDownload(stream.stream_id)}
                            disabled={stage === "downloading"}
                            className={`w-full md:w-auto border border-outline-variant px-4 py-2 font-label-caps text-label-caps transition-colors flex items-center justify-center md:justify-start gap-2 ${stage === "downloading" ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary hover:text-surface cursor-pointer"
                              }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span> DL
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-outline uppercase tracking-widest opacity-30 text-xs">NO_AUDIO_DATA_AVAILABLE</div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

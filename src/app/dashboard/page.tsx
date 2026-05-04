"use client";

import React, { useState, useEffect } from 'react';

// --- TYPES ---

interface RamStatus {
  total_bytes: number;
  used_bytes: number;
  percent: number;
}

interface DiskStatus {
  total_bytes: number;
  used_bytes: number;
  percent: number;
}

interface SystemStatus {
  cpu_percent: number | null;
  ram: RamStatus | null;
  disk: DiskStatus | null;
  uptime_seconds: number | null;
  active_jobs: number;
  queued_jobs: number;
  total_completed: number;
}

interface CompletedDownload {
  title: string;
  thumbnail: string | null;
  filename: string;
  size_bytes: number | null;
  source: string;
  format: string;
  quality: string;
  downloaded_at: string;
}

interface DownloadsStatus {
  recent: CompletedDownload[];
  stats: {
    total_downloads: number;
    total_size_bytes: number;
    by_platform: Record<string, number>;
    by_format: Record<string, number>;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [systemData, setSystemData] = useState<SystemStatus | null>(null);
  const [downloadsData, setDownloadsData] = useState<DownloadsStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // --- HELPER FUNCTIONS ---

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number | null): string => {
    if (seconds === null) return "--";
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (iso: string): string => {
    try {
      const date = new Date(iso);
      return date.toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");
    } catch {
      return "--";
    }
  };

  const fetchData = async () => {
    try {
      const [systemRes, downloadsRes] = await Promise.all([
        fetch(`${API_URL}/api/status/system`),
        fetch(`${API_URL}/api/status/downloads`)
      ]);

      if (systemRes.ok && downloadsRes.ok) {
        const sys = await systemRes.json();
        const dls = await downloadsRes.json();
        setSystemData(sys);
        setDownloadsData(dls);
        setLastUpdated(new Date());
        setFetchError(null); // Clear error on success
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
      // Don't clear stale data - keep showing last known values
      // Just show a small warning banner
      setFetchError('Failed to refresh. Showing last known data.');
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- DERIVED DATA ---

  const getDisplayTime = () => {
    if (!mounted) return "0000.00.00 00:00:00";
    if (lastUpdated) return lastUpdated.toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");
    return new Date().toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");
  };

  const itemsPerPage = 15;
  const recentDownloads = downloadsData?.recent || [];
  const totalPages = Math.max(1, Math.ceil(recentDownloads.length / itemsPerPage));
  const displayedDownloads = recentDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPlatformIcon = (source: string) => {
    const format = source.toLowerCase();
    switch (format) {
      case 'youtube': return "video_library";
      case 'tiktok': return "music_video";
      case 'instagram': return "photo_camera";
      case 'twitter': return "tag";
      case 'facebook': return "groups";
      case 'reddit': return "forum";
      default: return "link";
    }
  };

  return (
    <main className="flex-grow pt-12 pb-12 px-4 md:px-6 max-w-[1440px] mx-auto w-full z-10 relative">
      
      {/* Sync Error Warning Bar */}
      {fetchError && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-surface-container-high border-b border-error/30 py-1.5 px-4 animate-fade-in">
          <p className="text-center font-mono text-[10px] md:text-xs text-error uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {fetchError}
          </p>
        </div>
      )}
      {/* System Console Header */}
      <div className="mb-8 border-l-4 border-primary pl-4 py-2">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-headline-lg flex items-center tracking-tight break-words">
          <span className="opacity-50 mr-2 shrink-0">&gt;</span> 
          <span className="truncate">EXECUTE: DASHBOARD_v1.0.SH</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-label-caps text-outline">
          <span>[ SESSION: ACTIVE ]</span>
          <span>[ UPTIME: {systemData ? formatUptime(systemData.uptime_seconds) : "--"} ]</span>
          <span>[ REFRESH: 10s ]</span>
        </div>
      </div>

      {/* Metric Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* CPU */}
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">CPU_UTILIZATION</div>
          <div className="text-lg font-bold">
            {systemData && systemData.cpu_percent !== null ? `${systemData.cpu_percent}%` : "--"}
          </div>
          <div className="w-full bg-[#1A1A1A] h-1 mt-2">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${systemData && systemData.cpu_percent !== null ? systemData.cpu_percent : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Memory */}
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">MEMORY_USAGE</div>
          <div className="text-lg font-bold">
            {systemData?.ram ? `${(systemData.ram.used_bytes / (1024**3)).toFixed(1)} GB` : "--"}
          </div>
          <div className="w-full bg-[#1A1A1A] h-1 mt-2">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${systemData?.ram ? systemData.ram.percent : 0}%` }}
            ></div>
          </div>
          <div className="text-[10px] mt-1 text-primary-fixed-dim uppercase truncate">
            {systemData?.ram ? `${systemData.ram.percent}% of ${(systemData.ram.total_bytes / (1024**3)).toFixed(0)} GB` : "AWAITING_DATA"}
          </div>
        </div>

        {/* Disk */}
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">DISK_USAGE</div>
          <div className="text-lg font-bold">
            {systemData?.disk ? `${(systemData.disk.used_bytes / (1024**3)).toFixed(1)} GB` : "--"}
          </div>
          <div className="w-full bg-[#1A1A1A] h-1 mt-2">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${systemData?.disk ? systemData.disk.percent : 0}%` }}
            ></div>
          </div>
          <div className="text-[10px] mt-1 text-primary-fixed-dim uppercase truncate">
            {systemData?.disk ? `${systemData.disk.percent}% of ${(systemData.disk.total_bytes / (1024**3)).toFixed(0)} GB` : "AWAITING_DATA"}
          </div>
        </div>

        {/* Job Queue */}
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">JOB_QUEUE</div>
          <div className="text-lg font-bold">{systemData?.active_jobs ?? "--"} ACTIVE</div>
          <div className="flex justify-between mt-2 text-[10px] text-primary-fixed-dim uppercase">
            <span>QUEUED: {systemData?.queued_jobs ?? "--"}</span>
            <span>DONE: {systemData?.total_completed ?? "--"}</span>
          </div>
        </div>
      </div>

      {/* Extraction History Table */}
      <div className="border border-[#262626] bg-surface-container-lowest overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-[#1A1A1A] px-4 md:px-6 py-3 border-b border-[#262626] flex justify-between items-center">
          <span className="text-[10px] md:text-xs font-label-caps tracking-widest text-on-surface-variant truncate mr-2">
            RECENT_DOWNLOADS // {recentDownloads.length} RECORDS FOUND (PAGE {currentPage}/{Math.max(1, totalPages)})
          </span>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">search</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] md:text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-[#262626] text-outline">
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider hidden lg:table-cell w-[180px]">TIMESTAMP</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider w-[80px] md:w-[120px] hidden sm:table-cell">SOURCE</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider min-w-[120px]">FILENAME</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider text-right w-[100px]">SIZE</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider text-center w-[90px]">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {displayedDownloads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-outline uppercase tracking-widest opacity-50 font-mono">
                    NO_DATA_FOUND // ARCHIVE_EMPTY
                  </td>
                </tr>
              )}
              
              {displayedDownloads.map((dl, i) => (
                <tr key={i} className="hover:bg-[#121212] transition-colors group">
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell text-on-surface-variant/70">{formatTimestamp(dl.downloaded_at)}</td>
                  <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="material-symbols-outlined text-sm opacity-70">
                        {getPlatformIcon(dl.source)}
                      </span>
                      <span className="uppercase text-[9px] md:text-[10px]">{dl.source}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-primary truncate max-w-[150px] md:max-w-none font-bold" title={dl.filename}>
                    {dl.filename}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right text-on-surface-variant/80">{formatBytes(dl.size_bytes)}</td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <span className="px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] border bg-[#0D2010] text-[#4ADE80] border-[#1B3B20]">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-[#1A1A1A] px-4 md:px-6 py-4 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-label-caps text-outline order-2 md:order-1">
              SHOWING {(currentPage - 1) * itemsPerPage + 1} TO {Math.min(currentPage * itemsPerPage, recentDownloads.length)} OF {recentDownloads.length} ENTRIES
            </div>
            <div className="flex items-center gap-1 order-1 md:order-2">
              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center border border-[#262626] font-mono text-xs transition-colors ${
                  currentPage === 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-primary hover:text-surface cursor-pointer"
                }`}
              >
                &lt;
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 flex items-center justify-center border border-[#262626] font-mono text-xs transition-colors cursor-pointer ${
                      currentPage === pageNum ? "bg-primary text-surface border-primary" : "hover:bg-surface-container"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center border border-[#262626] font-mono text-xs transition-colors ${
                  currentPage === totalPages ? "opacity-20 cursor-not-allowed" : "hover:bg-primary hover:text-surface cursor-pointer"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Terminal Output Decorator */}
      <div className="mt-8 border border-[#262626] bg-[#050505] p-4 text-[11px] font-mono leading-relaxed text-[#444444]">
        <div className="text-[#666666] mb-1">STREAMS_DAEMON_LOG:</div>
        <div>[{getDisplayTime()}] init streams_daemon... [OK]</div>
        <div>[{getDisplayTime()}] binding to port 8080... [OK]</div>
        <div>[{getDisplayTime()}] Handshake successful with client: OP_01</div>
        <div>[{getDisplayTime()}] Querying index HISTORY_DB_V2... {recentDownloads.length} results returned</div>
        <div className="text-[#888888] animate-pulse">_</div>
      </div>
    </main>
  );
}

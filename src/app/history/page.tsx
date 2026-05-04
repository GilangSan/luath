"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteHistory, clearHistory } from "@/lib/history";
import { getFileUrl } from "@/lib/api";
import { HistoryItem } from "@/types";
import Link from "next/link";

// Helper functions
const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "N/A";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const allHistory = getHistory();
    // Sort by date descending (newest first)
    const sorted = [...allHistory].sort((a, b) => 
      new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime()
    );
    setHistory(sorted);
    setIsLoaded(true);
  }, []);

  const handleDelete = (jobId: string) => {
    deleteHistory(jobId);
    const updated = getHistory().sort((a, b) => 
      new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime()
    );
    setHistory(updated);
  };

  const handleClear = () => {
    if (confirm("ARE YOU SURE YOU WANT TO CLEAR ALL ARCHIVES?")) {
      clearHistory();
      setHistory([]);
      setCurrentPage(1);
    }
  };

  const totalSize = history.reduce((acc, item) => acc + (item.size_bytes || 0), 0);
  const successCount = history.filter(item => item.status === "completed").length;
  const successRate = history.length > 0 ? (successCount / history.length) * 100 : 100;

  // Pagination Logic
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="flex-grow pt-12 pb-12 px-4 md:px-6 max-w-[1440px] mx-auto w-full z-10 relative">
      {/* System Console Header */}
      <div className="mb-8 border-l-4 border-primary pl-4 py-2">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-headline-lg flex items-center tracking-tight break-words">
          <span className="opacity-50 mr-2 shrink-0">&gt;</span> 
          <span className="truncate">EXECUTE: VIEW_HISTORY.SH</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-label-caps text-outline">
          <span>[ SESSION: ACTIVE ]</span>
          <span>[ USER: OPERATOR_01 ]</span>
          <span>[ ARCHIVE_VER: 1.0.4 ]</span>
        </div>
      </div>

      {/* Metric Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">BUFFER_STATUS</div>
          <div className="text-lg font-bold">{isLoaded ? `${Math.min(100, Math.round((history.length / 500) * 100))}%` : "0%"} FILLED</div>
          <div className="w-full bg-[#1A1A1A] h-1 mt-2">
            <div className="bg-primary h-full" style={{ width: `${Math.min(100, (history.length / 500) * 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">TOTAL_ARCHIVE_SIZE</div>
          <div className="text-lg font-bold">{formatBytes(totalSize)}</div>
          <div className="text-[10px] mt-1 text-primary-fixed-dim uppercase truncate">ALL_SYSTEM_RECORDS</div>
        </div>
        <div className="bg-surface-container-low border border-[#262626] p-4">
          <div className="text-[10px] text-outline mb-1 font-label-caps">SUCCESS_RATE</div>
          <div className="text-lg font-bold">{successRate.toFixed(1)}%</div>
          <div className="text-[10px] mt-1 text-primary-fixed-dim">STATUS: OPERATIONAL</div>
        </div>
        <Link 
          href="/"
          className="bg-surface-container-low border border-[#262626] p-4 flex items-center justify-center border-dashed group cursor-pointer hover:bg-primary hover:text-surface transition-colors"
        >
          <div className="text-center">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
            <div className="text-[10px] font-label-caps mt-1">NEW_EXTRACTION</div>
          </div>
        </Link>
      </div>

      {/* Extraction History Table */}
      <div className="border border-[#262626] bg-surface-container-lowest overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-[#1A1A1A] px-4 md:px-6 py-3 border-b border-[#262626] flex justify-between items-center">
          <span className="text-[10px] md:text-xs font-label-caps tracking-widest text-on-surface-variant truncate mr-2">
            EXTRACTION_LOGS // {history.length} RECORDS FOUND (PAGE {currentPage}/{Math.max(1, totalPages)})
          </span>
          <div className="flex gap-4 items-center shrink-0">
            <button onClick={handleClear} className="text-[10px] text-error hover:underline font-label-caps cursor-pointer">CLEAR_ALL</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] md:text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-[#262626] text-outline">
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider hidden lg:table-cell w-[180px]">TIMESTAMP</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider w-[80px] md:w-[120px]">SOURCE</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider min-w-[120px]">FILENAME</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider text-right hidden md:table-cell w-[100px]">SIZE</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider text-center w-[90px]">STATUS</th>
                <th className="px-4 md:px-6 py-4 font-bold uppercase tracking-wider text-right w-[100px]">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {paginatedHistory.length === 0 && isLoaded && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline uppercase tracking-widest opacity-50 font-mono">
                    NO_DATA_FOUND // ARCHIVE_EMPTY
                  </td>
                </tr>
              )}
              
              {paginatedHistory.map((item) => (
                <tr key={item.job_id} className="hover:bg-[#121212] transition-colors group">
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell text-on-surface-variant/70">{formatDate(item.downloaded_at)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="material-symbols-outlined text-sm opacity-70">
                        {item.format === "m4a" || item.quality.includes("kbps") ? "audio_file" : "video_library"}
                      </span>
                      <span className="uppercase text-[9px] md:text-[10px]">{item.source}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-primary truncate max-w-[150px] md:max-w-none font-bold" title={item.filename}>
                    {item.filename}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right hidden md:table-cell text-on-surface-variant/80">{formatBytes(item.size_bytes)}</td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <span className={`px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] border ${
                      item.status === "completed" 
                        ? "bg-[#0D2010] text-[#4ADE80] border-[#1B3B20]" 
                        : "bg-[#2A0F0F] text-[#F87171] border-[#4B1B1B]"
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      {item.status === "completed" && (
                        <button 
                          onClick={() => window.open(getFileUrl(item.job_id), "_blank")}
                          className="text-primary hover:text-white transition-colors cursor-pointer"
                          title="DOWNLOAD"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.job_id)}
                        className="text-error hover:text-white transition-colors cursor-pointer"
                        title="DELETE"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
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
              SHOWING {(currentPage - 1) * itemsPerPage + 1} TO {Math.min(currentPage * itemsPerPage, history.length)} OF {history.length} ENTRIES
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
        <div>[{new Date().toISOString().replace("T", " ").split(".")[0]}] Handshake successful with client: OP_01</div>
        <div>[{new Date().toISOString().replace("T", " ").split(".")[0]}] Querying index HISTORY_DB_V2... {history.length} results returned</div>
      </div>
    </main>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  DownloadStage, 
  ExtractResponse, 
  StreamOption, 
  HistoryItem, 
  JobStatusResponse 
} from "@/types";
import { 
  extractVideo, 
  startDownload as startDownloadApi, 
  getJobStatus, 
  getFileUrl 
} from "@/lib/api";
import { addHistory } from "@/lib/history";
import { parseError, ErrorDisplay } from "@/lib/error-utils";

export function useDownload() {
  const [stage, setStage] = useState<DownloadStage>("idle");
  const [metadata, setMetadata] = useState<ExtractResponse | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamOption | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const reset = useCallback(() => {
    clearPolling();
    setStage("idle");
    setMetadata(null);
    setSelectedStream(null);
    setJobId(null);
    setProgress(0);
    setError(null);
    setCurrentUrl("");
  }, [clearPolling]);

  const dismissDownload = useCallback(() => {
    clearPolling();
    setStage("extracted");
    setJobId(null);
    setProgress(0);
    setError(null);
  }, [clearPolling]);

  const extract = async (url: string) => {
    reset();
    setStage("extracting");
    setCurrentUrl(url);
    try {
      const data = await extractVideo(url);
      setMetadata(data);
      setStage("extracted");
    } catch (err) {
      setError(parseError(err));
      setStage("failed");
    }
  };

  const startDownload = async (stream_id: string) => {
    if (!metadata || !currentUrl) return;

    const stream = metadata.streams.find((s) => s.stream_id === stream_id);
    if (!stream) {
      setError({
        title: "CLIENT_ERROR",
        message: "Selected stream not found",
        code: "stream_not_found",
        retryable: false
      });
      setStage("failed");
      return;
    }

    setSelectedStream(stream);
    setStage("downloading");
    setProgress(0);
    setError(null);

    try {
      const { job_id } = await startDownloadApi(currentUrl, stream_id);
      setJobId(job_id);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusData: JobStatusResponse = await getJobStatus(job_id);
          setProgress(statusData.progress);

          if (statusData.status === "completed") {
            clearPolling();
            
            // Save to history
            const historyItem: HistoryItem = {
              job_id: statusData.job_id,
              url: currentUrl,
              title: metadata.title,
              thumbnail: metadata.thumbnail,
              filename: statusData.filename || "download",
              size_bytes: statusData.size_bytes,
              source: metadata.source,
              format: stream.format,
              quality: stream.quality,
              downloaded_at: new Date().toISOString(),
              status: "completed",
            };
            addHistory(historyItem);

            // Trigger browser download
            const downloadUrl = getFileUrl(job_id);
            
            // Create a hidden anchor element to trigger download
            const link = document.createElement("a");
            link.href = downloadUrl;
            // Use the filename from server if available
            if (statusData.filename) {
              link.setAttribute("download", statusData.filename);
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setStage("completed");
          } else if (statusData.status === "failed") {
            clearPolling();
            setError({
              title: 'DOWNLOAD_FAILED',
              message: statusData.error ?? 'Download failed. Please try again.',
              code: 'download_error',
              retryable: true
            });
            setStage("failed");
          }
        } catch (err) {
          clearPolling();
          setError(parseError(err));
          setStage("failed");
        }
      }, 2000);
    } catch (err) {
      setError(parseError(err));
      setStage("failed");
    }
  };

  return {
    stage,
    metadata,
    selectedStream,
    jobId,
    progress,
    error,
    extract,
    startDownload,
    reset,
    dismissDownload,
  };
}

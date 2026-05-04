export type StreamType = "video" | "audio" | "merged";

export interface StreamOption {
  stream_id: string;
  format: string;
  quality: string;
  type: StreamType;
  est_size_bytes: number | null;
  fps: number | null;
}

export interface ExtractResponse {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  channel: string | null;
  views: number | null;
  fps: number | null;
  description: string | null;
  source: string;
  streams: StreamOption[];
}

export type JobStatus = "queued" | "downloading" | "completed" | "failed";

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  filename: string | null;
  size_bytes: number | null;
  source: string | null;
  error: string | null;
}

export interface HistoryItem {
  job_id: string;
  url: string;
  title: string;
  thumbnail: string | null;
  filename: string;
  size_bytes: number | null;
  source: string;
  format: string;
  quality: string;
  downloaded_at: string; // ISO string
  status: "completed" | "failed";
}

export type DownloadStage =
  | "idle"
  | "extracting"
  | "extracted"
  | "downloading"
  | "completed"
  | "failed";

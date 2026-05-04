from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class StreamType(str, Enum):
    VIDEO = "video"
    AUDIO = "audio"
    MERGED = "merged"
    IMAGE = "image"

class StreamOption(BaseModel):
    stream_id: str
    format: str
    quality: str
    type: StreamType
    est_size_bytes: Optional[int] = None
    fps: Optional[int] = None

class ExtractRequest(BaseModel):
    url: str

class ExtractResponse(BaseModel):
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    channel: Optional[str] = None
    views: Optional[int] = None
    fps: Optional[int] = None
    description: Optional[str] = None
    source: str
    streams: List[StreamOption]

class DownloadStartRequest(BaseModel):
    url: str
    stream_id: str
    filename: Optional[str] = None
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    source: Optional[str] = None
    format: Optional[str] = None
    quality: Optional[str] = None

class CompletedDownload(BaseModel):
    title: str
    thumbnail: Optional[str] = None
    filename: str
    size_bytes: Optional[int] = None
    source: str
    format: str
    quality: str
    downloaded_at: str

class JobStatus(str, Enum):
    QUEUED = "queued"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: float = 0.0
    filename: Optional[str] = None
    size_bytes: Optional[int] = None
    source: Optional[str] = None
    error: Optional[str] = None

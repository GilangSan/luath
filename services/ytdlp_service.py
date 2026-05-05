import yt_dlp
import asyncio
import os
import logging
import concurrent.futures
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)

# Constants
DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

from models.schemas import (
    StreamOption, 
    ExtractResponse, 
    StreamType, 
    JobStatus,
    CompletedDownload
)
from .job_store import job_store, record_completed
from .instagram_service import instagram_service
from services.error_handler import classify_ytdlp_error, raise_ytdlp_error

logger = logging.getLogger(__name__)

MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

def detect_source(url: str) -> str:
    """
    Detect platform from URL.
    Return lowercase string: 
    "youtube" | "tiktok" | "instagram" | "twitter" | 
    "facebook" | "reddit" | "vimeo" | "twitch" | 
    "dailymotion" | "soundcloud" | "bilibili" | "pinterest" | "other"
    """
    url = url.lower()
    if any(x in url for x in ["youtube.com", "youtu.be", "youtube-nocookie.com"]):
        return "youtube"
    if "tiktok.com" in url:
        return "tiktok"
    if "instagram.com" in url:
        return "instagram"
    if any(x in url for x in ["twitter.com", "x.com", "t.co"]):
        return "twitter"
    if any(x in url for x in ["facebook.com", "fb.watch", "fb.com"]):
        return "facebook"
    if "reddit.com" in url:
        return "reddit"
    if "vimeo.com" in url:
        return "vimeo"
    if "twitch.tv" in url:
        return "twitch"
    if any(x in url for x in ["dailymotion.com", "dai.ly"]):
        return "dailymotion"
    if "soundcloud.com" in url:
        return "soundcloud"
    if any(x in url for x in ["bilibili.com", "b23.tv"]):
        return "bilibili"
    if any(x in url for x in ["pinterest.com", "pin.it"]):
        return "pinterest"
    return "other"

def get_ydl_opts(url: str, skip_download: bool = True) -> dict:
    """
    Base opts (apply to all):
    - quiet: True
    - no_warnings: True
    - skip_download: skip_download
    """
    source = detect_source(url)
    
    opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': skip_download,
        'socket_timeout': 30,
        'retries': 3,
        'nocheckcertificate': True,
        'restrictfilenames': True,
    }

    # Advanced JS and Remote Components (Fix for YouTube n-challenge)
    # Detect Node.exe for Windows or use 'node' for Linux/Mac
    node_executable = 'node'
    if os.name == 'nt' and os.path.exists(r'C:\Program Files\nodejs\node.exe'):
        node_executable = r'C:\Program Files\nodejs\node.exe'
        os.environ['PATH'] = r'C:\Program Files\nodejs' + os.pathsep + os.environ.get('PATH', '')

    opts['js_runtimes'] = {'node': {'executable': node_executable}}
    opts['remote_components'] = {'ejs:github'}

    # Unified Cookie Handling
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cookie_path = os.path.join(project_root, "cookies", f"{source}_cookies.txt")
    
    if os.path.exists(cookie_path):
        opts['cookiefile'] = cookie_path
        logger.info(f"Using cookies for {source} from {cookie_path}")
    
    if source == "instagram":
        opts['http_headers'] = {"User-Agent": MOBILE_UA}
    elif source == "tiktok":
        opts['http_headers'] = {
            "User-Agent": DESKTOP_UA,
            "Referer": "https://www.tiktok.com/"
        }
    elif source == "youtube":
        opts['http_headers'] = {
            "User-Agent": DESKTOP_UA,
            "Referer": "https://www.youtube.com/",
            "Accept-Language": "en-US,en;q=0.9",
        }
        opts['extractor_args'] = {
            'youtube': {
                'player_client': ['default'],
            }
        }
        # Force high-quality manifests
        opts['youtube_include_dash_manifest'] = True
        opts['youtube_include_hls_manifest'] = True
    
    return opts

def normalize_info(info: dict, url: str) -> dict:
    """
    Safely extract metadata from yt-dlp info dict.
    Every field must have a fallback — never assume a field exists.
    """
    # Thumbnail fallback logic
    thumbnail = info.get('thumbnail')
    if not thumbnail and info.get('thumbnails'):
        thumbnails = info.get('thumbnails')
        if isinstance(thumbnails, list) and len(thumbnails) > 0:
            thumbnail = thumbnails[-1].get('url')
    
    # Duration fallback
    duration = info.get('duration')
    if duration is not None:
        duration = int(duration)
    
    # Channel fallback
    channel = info.get('channel') or info.get('uploader') or info.get('creator')
    
    # FPS from best video stream
    fps = info.get('fps')
    if not fps and info.get('formats'):
        # Try to find fps in formats if not at top level
        video_formats = [f for f in info['formats'] if f.get('vcodec') != 'none' and f.get('fps')]
        if video_formats:
            fps = max(f.get('fps', 0) for f in video_formats)
    
    # Description truncation
    description = info.get('description')
    if description and len(description) > 300:
        description = description[:297] + "..."
        
    return {
        "title": info.get('title') or "Untitled",
        "thumbnail": thumbnail,
        "duration": duration,
        "channel": channel,
        "views": info.get('view_count'),
        "fps": fps,
        "description": description,
        "source": detect_source(url),
    }

def normalize_streams(info: dict) -> list[StreamOption]:
    """
    Rules for ALL platforms.
    """
    raw_formats = info.get('formats', [])
    streams: List[StreamOption] = []
    seen_keys = set()
    
    for fmt in raw_formats:
        # 1. Skip forbidden extensions
        ext = str(fmt.get('ext', '')).lower()
        if ext in ["mhtml", "vtt", "none", ""]:
            continue
            
        # 2. Skip storyboard format_ids
        format_id = str(fmt.get('format_id', ''))
        if any(x in format_id for x in ["storyboard", "sb0", "sb1", "sb2"]):
            continue
            
        # 2b. Skip ultra-low resolution video variants (< 144p)
        # These come from DASH manifests and are not useful for users
        height = fmt.get('height')
        vcodec = fmt.get('vcodec')
        if height and vcodec and vcodec != 'none' and height < 144:
            continue
            
        # 3. Determine StreamType
        vcodec = fmt.get('vcodec')
        acodec = fmt.get('acodec')
        
        v_ok = vcodec and vcodec != 'none'
        a_ok = acodec and acodec != 'none'
        
        if v_ok:
            # Since we now always merge with bestaudio, 
            # all video streams are effectively MERGED for the user.
            s_type = StreamType.MERGED
        elif a_ok:
            s_type = StreamType.AUDIO
        else:
            continue
            
        # 4. Build quality label
        quality = ""
        format_note = fmt.get('format_note')
        resolution = fmt.get('resolution')
        height = fmt.get('height')
        abr = fmt.get('abr')
        
        if format_note and str(format_note).strip():
            quality = str(format_note)
        elif resolution and resolution != "audio only":
            quality = str(resolution)
        elif height:
            quality = f"{height}p"
        elif abr:
            quality = f"{int(abr)} kbps"
        else:
            quality = format_id
            
        # 5. est_size_bytes
        est_size = fmt.get('filesize') or fmt.get('filesize_approx')
        
        # If it's a video-only stream that we'll merge with audio, add best audio size estimate
        if v_ok and not a_ok:
            # Find best audio format to estimate its size
            audio_formats = [f for f in raw_formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none']
            if audio_formats:
                # Sort by quality/filesize to find the "best" one we'd likely pick
                best_audio = max(audio_formats, key=lambda f: f.get('filesize') or f.get('filesize_approx') or 0)
                a_size = best_audio.get('filesize') or best_audio.get('filesize_approx') or 0
                if est_size is not None:
                    est_size += a_size

        # 6. fps
        fps = fmt.get('fps') if v_ok else None
        
        # 7. Deduplication
        dup_key = (quality, ext, s_type)
        if dup_key in seen_keys:
            continue
        seen_keys.add(dup_key)
        
        streams.append(StreamOption(
            stream_id=format_id,
            format=ext,
            quality=quality,
            type=s_type,
            est_size_bytes=est_size,
            fps=fps
        ))
        
    # 8. Sorting
    def sort_key(s: StreamOption):
        # Type priority
        type_prio = {StreamType.MERGED: 0, StreamType.VIDEO: 1, StreamType.AUDIO: 2}.get(s.type, 3)
        # Size priority (None at end)
        size = s.est_size_bytes
        if size is None:
            return (type_prio, 1, 0)
        return (type_prio, 0, -size)
        
    streams.sort(key=sort_key)
    
    # 9. Synthesize an MP3 Audio Option if audio is available
    # This provides a consistent "MP3" choice for users even if the platform
    # provides other formats (like m4a or webm).
    has_audio = any(s.type in [StreamType.AUDIO, StreamType.MERGED] for s in streams)
    has_mp3 = any(s.type == StreamType.AUDIO and s.format == "mp3" for s in streams)
    
    if has_audio and not has_mp3:
        streams.append(StreamOption(
            stream_id="bestaudio",
            format="mp3",
            quality="High Quality Audio (MP3)",
            type=StreamType.AUDIO,
            est_size_bytes=None,
            fps=None
        ))
 
    return streams

class YTDLPService:
    def __init__(self):
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)
        self.loop = None

    async def extract_info(self, url: str) -> ExtractResponse:
        """
        Extract metadata and streams for any supported platform.
        """
        if not self.loop:
            self.loop = asyncio.get_event_loop()
            
        opts = get_ydl_opts(url, skip_download=True)
        
        if detect_source(url) == "instagram":
            return await instagram_service.extract_info(url)

        try:
            # Run yt-dlp in thread pool
            info = await self.loop.run_in_executor(
                self.executor, 
                lambda: self._sync_extract(url, opts)
            )
            
            # Normalize
            metadata = normalize_info(info, url)
            streams = normalize_streams(info)
            
            if not streams:
                raise HTTPException(
                    status_code=400, 
                    detail={
                        "error": "no_streams_found",
                        "message": "No downloadable streams were found for this URL. The content may be protected or unsupported."
                    }
                )
                
            return ExtractResponse(
                **metadata,
                streams=streams
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Extraction failed for {url}: {str(e)}")
            raise_ytdlp_error(str(e))

    def _sync_extract(self, url: str, opts: dict) -> dict:
        with yt_dlp.YoutubeDL(opts) as ydl:
            return ydl.extract_info(url, download=False)

    async def start_download(
        self, 
        job_id: str, 
        url: str, 
        stream_id: str, 
        filename: str, 
        output_dir: str,
        title: str,
        thumbnail: Optional[str],
        source: str,
        format: str,
        quality: str
    ) -> None:
        """
        Start the download process in the background.
        """
        if not self.loop:
            self.loop = asyncio.get_event_loop()
            
        os.makedirs(output_dir, exist_ok=True)
        
        # Store extra metadata in job store
        await job_store.update_job(
            job_id,
            title=title,
            thumbnail=thumbnail,
            source=source,
            format=format,
            quality=quality
        )
        
        # Delegate to Instagram service if source is instagram
        if detect_source(url) == "instagram":
            # Note: We might need to update instagram_service signature too, 
            # but for now we follow the user's specific task for ytdlp_service.
            await instagram_service.start_download(job_id, url, stream_id, filename, output_dir)
            return

        # Base opts
        opts = get_ydl_opts(url, skip_download=False)
        
        # Download specific opts
        outtmpl_path = os.path.join(output_dir, f"{filename.rsplit('.', 1)[0]}.%(ext)s")
        if stream_id == "bestaudio":
            opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': outtmpl_path,
            })
        else:
            opts.update({
                'format': f"{stream_id}+bestaudio/best",
                'outtmpl': outtmpl_path,
            })
            # If the user specifically chose mp4, ensure the merged output is mp4
            if format.lower() == "mp4":
                opts['merge_output_format'] = 'mp4'
            
        # Common opts for both
        opts.update({
            'progress_hooks': [lambda d: self._progress_hook(d, job_id)],
            'max_filesize': 1024 * 1024 * 1024, # 1GB limit
        })
        
        await job_store.increment_active()
        
        # Run in executor
        self.loop.run_in_executor(
            self.executor,
            self._sync_download,
            job_id,
            url,
            opts
        )

    def _sync_download(self, job_id: str, url: str, opts: dict):
        final_filename = None
        
        # Add a post-processor hook to capture the final filename after conversion
        def pp_hook(d):
            nonlocal final_filename
            if d['status'] == 'finished':
                # The info_dict here has the final filepath
                fpath = d.get('info_dict', {}).get('filepath')
                if fpath:
                    final_filename = os.path.basename(fpath)

        if 'postprocessor_hooks' not in opts:
            opts['postprocessor_hooks'] = []
        opts['postprocessor_hooks'].append(pp_hook)

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])
                
            if not final_filename:
                output_dir = os.path.dirname(opts['outtmpl'])
                files = os.listdir(output_dir)
                if files:
                    files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
                    final_filename = files[0]

            # Mark as completed only AFTER download and post-processing are done
            asyncio.run_coroutine_threadsafe(
                self._handle_completion(job_id, final_filename),
                self.loop
            )
        except Exception as e:
            logger.error(f"Download failed for job {job_id}: {str(e)}")
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(job_id, status=JobStatus.FAILED, error=str(e)),
                self.loop
            )
        finally:
            asyncio.run_coroutine_threadsafe(
                job_store.decrement_active(),
                self.loop
            )

    async def _handle_completion(self, job_id: str, final_filename: str):
        """Helper to mark job as completed and record it in history."""
        await job_store.update_job(
            job_id, 
            status=JobStatus.COMPLETED, 
            progress=100.0,
            filename=final_filename
        )
        
        # Record in history
        job = job_store.get_job(job_id)
        if job:
            record_completed(CompletedDownload(
                title=job.get("title") or "Untitled",
                thumbnail=job.get("thumbnail"),
                filename=final_filename or job.get("filename", "unknown"),
                size_bytes=job.get("size_bytes"),
                source=job.get("source") or "unknown",
                format=job.get("format") or "unknown",
                quality=job.get("quality") or "unknown",
                downloaded_at=datetime.now().isoformat()
            ))

    def _progress_hook(self, d: dict, job_id: str):
        """
        Progress hook called by yt-dlp from a background thread.
        """
        if d['status'] == 'downloading':
            downloaded = d.get('downloaded_bytes', 0)
            total = d.get('total_bytes') or d.get('total_bytes_estimate')
            
            progress = (downloaded / total * 100) if total else 0.0
            
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(
                    job_id, 
                    status=JobStatus.DOWNLOADING, 
                    progress=progress,
                    size_bytes=total
                ),
                self.loop
            )
            
        elif d['status'] == 'finished':
            # Update progress to 100%
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(
                    job_id, 
                    progress=100.0
                ),
                self.loop
            )
            # I'll stick to doing it after ydl.download() for reliability, 
            # but I'll ensure the fields are there.
            
        elif d['status'] == 'error':
            raw = str(d.get('error', 'Unknown download error'))
            _, _, user_message = classify_ytdlp_error(raw)
            
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(
                    job_id, 
                    status=JobStatus.FAILED, 
                    error=user_message
                ),
                self.loop
            )

# Export instance
ytdlp_service = YTDLPService()

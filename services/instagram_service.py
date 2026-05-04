import instaloader
import asyncio
import os
import logging
import concurrent.futures
import shutil
from typing import List, Optional
from fastapi import HTTPException

from models.schemas import (
    StreamOption, 
    ExtractResponse, 
    StreamType, 
    JobStatus
)
from .job_store import job_store

logger = logging.getLogger(__name__)

class InstagramService:
    def __init__(self):
        # Subclassing to prevent path sanitization (the 'slash lebar' issue)
        class CustomInstaloader(instaloader.Instaloader):
            def get_post_dirname(self, _post, target):
                return target

        self.L = CustomInstaloader(
            download_videos=True,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
        )
        # In a real app, you'd load a session here
        # self.L.load_session_from_file(username)
        
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)
        self.loop = None

    def get_shortcode(self, url: str) -> str:
        parts = url.strip("/").split("/")
        for marker in ["p", "reels", "reel"]:
            if marker in parts:
                idx = parts.index(marker)
                if idx + 1 < len(parts):
                    return parts[idx + 1].split("?")[0]
        return ""

    async def extract_info(self, url: str) -> ExtractResponse:
        if not self.loop:
            self.loop = asyncio.get_event_loop()

        shortcode = self.get_shortcode(url)
        if not shortcode:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "invalid_url",
                    "message": "The provided Instagram URL is invalid or malformed."
                }
            )

        try:
            post = await self.loop.run_in_executor(
                self.executor,
                lambda: instaloader.Post.from_shortcode(self.L.context, shortcode)
            )

            streams = []
            
            # If it's a sidecar (multiple images/videos)
            if post.typename == "GraphSidecar":
                for i, node in enumerate(post.get_sidecar_nodes()):
                    if node.is_video:
                        streams.append(StreamOption(
                            stream_id=f"video_{i}",
                            format="mp4",
                            quality=f"Slide {i+1} (Video)",
                            type=StreamType.VIDEO,
                            # instaloader doesn't easily give file size before download
                        ))
                    else:
                        streams.append(StreamOption(
                            stream_id=f"image_{i}",
                            format="jpg",
                            quality=f"Slide {i+1} (Image)",
                            type=StreamType.IMAGE,
                        ))
            else:
                if post.is_video:
                    streams.append(StreamOption(
                        stream_id="video_0",
                        format="mp4",
                        quality="Video",
                        type=StreamType.VIDEO,
                    ))
                else:
                    streams.append(StreamOption(
                        stream_id="image_0",
                        format="jpg",
                        quality="Image",
                        type=StreamType.IMAGE,
                    ))

            return ExtractResponse(
                title=f"Instagram Post by {post.owner_username}",
                thumbnail=post.url,
                duration=int(post.video_duration) if post.is_video else None,
                channel=post.owner_username,
                description=post.caption[:300] if post.caption else None,
                source="instagram",
                streams=streams
            )

        except Exception as e:
            logger.error(f"Instagram extraction failed: {e}")
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "extraction_failed",
                    "message": f"Failed to extract media info from this Instagram post: {str(e)}"
                }
            )

    async def start_download(self, job_id: str, url: str, stream_id: str, filename: str, output_dir: str) -> None:
        if not self.loop:
            self.loop = asyncio.get_event_loop()

        os.makedirs(output_dir, exist_ok=True)
        
        await job_store.increment_active()
        
        self.loop.run_in_executor(
            self.executor,
            self._sync_download,
            job_id,
            url,
            stream_id,
            output_dir,
            filename
        )

    def _sync_download(self, job_id: str, url: str, stream_id: str, output_dir: str, filename: str):
        # We use a relative folder name as the instaloader target to avoid
        # Windows path-sanitisation issues.  instaloader replaces backslashes
        # with fullwidth chars (﹨), which turns an absolute path into a single
        # flat folder name in the CWD.  By chdir-ing into output_dir first and
        # passing only a short basename, there are no separators to mangle.
        temp_basename = f"tmp_{job_id}"
        temp_abs = os.path.join(output_dir, temp_basename)
        original_cwd = os.getcwd()

        try:
            shortcode = self.get_shortcode(url)
            post = instaloader.Post.from_shortcode(self.L.context, shortcode)

            # Determine which slide to keep (carousel / sidecar support)
            idx = 0
            if "_" in stream_id:
                try:
                    idx = int(stream_id.split("_")[1])
                except Exception:
                    pass

            # Update status
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(job_id, status=JobStatus.DOWNLOADING, progress=50.0),
                self.loop
            )

            # ---- core fix: chdir + relative target ----
            os.makedirs(output_dir, exist_ok=True)
            os.chdir(output_dir)
            self.L.download_post(post, target=temp_basename)
            os.chdir(original_cwd)  # restore immediately after download
            # -------------------------------------------

            if not os.path.exists(temp_abs):
                raise Exception(f"Download failed: temporary folder {temp_abs} not created")

            # Pick the right media file from the temp folder
            files = [
                f for f in os.listdir(temp_abs)
                if f.endswith((".mp4", ".jpg", ".png", ".webp"))
            ]
            files.sort()

            if not files:
                raise Exception("No media files found after download")

            selected_file = files[idx] if idx < len(files) else files[0]

            src = os.path.join(temp_abs, selected_file)
            dst = os.path.join(output_dir, filename)

            if os.path.exists(dst):
                os.remove(dst)
            shutil.move(src, dst)

            # Mark as completed
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(
                    job_id,
                    status=JobStatus.COMPLETED,
                    progress=100.0,
                    filename=filename
                ),
                self.loop
            )

            # Cleanup the temp folder
            try:
                shutil.rmtree(temp_abs)
            except Exception:
                pass

        except Exception as e:
            logger.error(f"Instagram download failed: {e}")
            asyncio.run_coroutine_threadsafe(
                job_store.update_job(job_id, status=JobStatus.FAILED, error=str(e)),
                self.loop
            )
            # Cleanup temp folder on error
            try:
                if os.path.exists(temp_abs):
                    shutil.rmtree(temp_abs)
            except Exception:
                pass

        finally:
            # Always restore the CWD, even on error
            try:
                os.chdir(original_cwd)
            except Exception:
                pass
            asyncio.run_coroutine_threadsafe(
                job_store.decrement_active(),
                self.loop
            )

instagram_service = InstagramService()

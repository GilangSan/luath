from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from models.schemas import DownloadStartRequest, JobStatusResponse
from services.job_store import job_store
from services.ytdlp_service import ytdlp_service
from limiter import limiter
import uuid
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Base directory for downloads
BASE_DOWNLOAD_DIR = os.path.join(os.getcwd(), "dl_jobs")

@router.post("/download/start")
@limiter.limit("5/minute")
async def start_download(request: Request, body: DownloadStartRequest):
    # Check rate limit
    if not await job_store.can_start_download():
        raise HTTPException(
            status_code=429, 
            detail={
                "error": "rate_limit_exceeded",
                "message": "Too many concurrent downloads. Please wait for others to finish."
            }
        )

    job_id = str(uuid.uuid4())
    
    # Pre-extract to get source/filename and verify size
    try:
        # We always extract to verify the 1GB limit and get fresh metadata
        info = await ytdlp_service.extract_info(body.url)
        
        selected_stream = next((s for s in info.streams if s.stream_id == body.stream_id), None)
        if not selected_stream:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "stream_not_found",
                    "message": "The selected quality option is no longer available."
                }
            )
            
        # Check size limit (1GB = 1024 * 1024 * 1024 bytes)
        MAX_SIZE = 1024 * 1024 * 1024
        if selected_stream.est_size_bytes and selected_stream.est_size_bytes > MAX_SIZE:
            size_gb = selected_stream.est_size_bytes / MAX_SIZE
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "file_too_large",
                    "message": f"File too large ({size_gb:.2f} GB). Maximum allowed is 1.00 GB."
                }
            )

        source = info.source
        title = info.title
        thumbnail = info.thumbnail
        format_name = selected_stream.format
        quality = selected_stream.quality
        ext = format_name

        filename = body.filename or f"{title}.{ext}"
        # Sanitize filename (basic)
        filename = "".join([c for c in filename if c.isalnum() or c in "._- "]).strip()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pre-extraction failed: {e}")
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "extraction_failed",
                "message": "Could not extract video info. Please check the URL and try again."
            }
        )

    # We store the base filename in the job store, start_download will update it with the unique prefix if needed
    # but here we follow the existing pattern of prefixing with job_id
    full_filename = f"{job_id}_{filename}"
    
    await job_store.create_job(job_id, source=source, filename=full_filename)
    
    # Start in background
    await ytdlp_service.start_download(
        job_id=job_id,
        url=body.url,
        stream_id=body.stream_id,
        filename=full_filename,
        output_dir=BASE_DOWNLOAD_DIR,
        title=title or "",
        thumbnail=thumbnail,
        source=source or "",
        format=format_name or "",
        quality=quality or ""
    )
    
    return {"job_id": job_id, "status": "queued"}

@router.get("/download/status/{job_id}", response_model=JobStatusResponse)
@limiter.limit("60/minute")
async def get_status(request: Request, job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "job_not_found",
                "message": "Download job not found. It may have expired."
            }
        )
    return job

@router.get("/download/file/{job_id}")
@limiter.limit("10/minute")
async def get_file(request: Request, job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "job_not_found",
                "message": "Download job not found. It may have expired."
            }
        )
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "job_not_completed",
                "message": f"Job is not completed yet. Current status: {job['status']}"
            }
        )

    filename = job["filename"]
    file_path = os.path.join(BASE_DOWNLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "file_not_found",
                "message": "The downloaded file was not found on the server. It may have been cleaned up."
            }
        )

    return FileResponse(
        path=file_path,
        filename=filename.replace(f"{job_id}_", ""), # Remove prefix for the user
        media_type='application/octet-stream'
    )

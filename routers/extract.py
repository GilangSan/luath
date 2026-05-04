from fastapi import APIRouter, HTTPException, Request
from models.schemas import ExtractRequest, ExtractResponse
from services.ytdlp_service import ytdlp_service
from limiter import limiter
import logging

import yt_dlp
from services.error_handler import raise_ytdlp_error

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/extract", response_model=ExtractResponse)
@limiter.limit("10/minute")
async def extract_info(request: Request, body: ExtractRequest):
    try:
        return await ytdlp_service.extract_info(body.url)
    except (yt_dlp.utils.DownloadError, yt_dlp.utils.ExtractorError) as e:
        raise_ytdlp_error(str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extraction failed for {body.url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "internal_error",
                "message": "Failed to process this URL. Please try again."
            }
        )

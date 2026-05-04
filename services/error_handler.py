import re
from typing import Tuple, Dict, Any
from fastapi import HTTPException

def classify_ytdlp_error(raw_error: str) -> Tuple[int, str, str]:
    """
    Parse raw yt-dlp error string and return:
    (http_status_code, error_code, user_message)
    """
    # Strip ANSI color codes
    clean = re.sub(r'\x1b\[[0-9;]*m', '', raw_error)
    
    # AVAILABILITY ERRORS -> 400
    if any(x in clean for x in ["Video not available", "Video unavailable", "status code 0"]):
        return 400, "video_unavailable", "This video is not available. It may have been deleted or is restricted in your region."
    
    if any(x in clean for x in ["Private video", "This video is private"]):
        return 400, "video_private", "This video is private and cannot be downloaded."
    
    if any(x in clean for x in ["members-only", "Member-only"]):
        return 400, "members_only", "This content is for members only."
    
    if any(x in clean for x in ["age-restricted", "age restricted", "confirm your age"]):
        return 400, "age_restricted", "This video is age-restricted and cannot be downloaded without authentication."
    
    if any(x in clean for x in ["This live event will begin", "Premieres in"]):
        return 400, "not_yet_available", "This content has not been released yet."
    
    if any(x in clean for x in ["has been removed", "account has been terminated"]):
        return 400, "content_removed", "This content has been removed by the platform."

    # AUTH ERRORS -> 401
    if any(x in clean for x in ["Sign in", "login required", "requires authentication"]):
        return 401, "auth_required", "This content requires login to download. Authentication is not supported at this time."
    
    if any(x in clean for x in ["cookies", "This video is only available for"]):
        return 401, "cookies_required", "This content requires account cookies to access."

    # GEO ERRORS -> 403
    if any(x in clean for x in ["not available in your country", "geo", "geographical", "region"]):
        return 403, "geo_restricted", "This content is not available in the server's region."

    # PLATFORM ERRORS -> 422
    if any(x in clean for x in ["Unsupported URL", "is not a valid URL", "is not a valid", "Unable to extract"]):
        return 422, "unsupported_url", "This URL is not supported. Please check that the link is valid and from a supported platform."
    
    if any(x in clean for x in ["Unable to download webpage", "Failed to extract"]):
        return 422, "extraction_failed", "Failed to extract media info from this URL. The platform may have changed its structure."

    # NETWORK ERRORS -> 503
    if any(x in clean for x in ["Connection", "timed out", "Network"]):
        return 503, "network_error", "Could not reach the platform. Please try again in a moment."
    
    if any(x in clean for x in ["HTTP Error 429", "Too Many Requests"]):
        return 503, "platform_rate_limited", "The platform is rate limiting our server. Please try again in a few minutes."
    
    if "HTTP Error 403" in clean:
        return 503, "platform_forbidden", "Access to this content was denied by the platform."
    
    if "HTTP Error 404" in clean:
        return 503, "not_found", "Content not found. The URL may be invalid or the content may have been deleted."

    # FALLBACK -> 500
    return 500, "download_error", "An unexpected error occurred while processing this request. Please try again."

def raise_ytdlp_error(raw_error: str) -> None:
    """
    Classify raw yt-dlp error and raise HTTPException with clean JSON detail.
    """
    status_code, error_code, user_message = classify_ytdlp_error(raw_error)
    
    raise HTTPException(
        status_code=status_code,
        detail={
            "error": error_code,
            "message": user_message,
            "platform_error": True
        }
    )

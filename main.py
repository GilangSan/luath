import uvicorn
import asyncio
import os
import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
from routers import extract, download, status
from services.job_store import job_store

# Set start time for uptime tracking
START_TIME = time.time()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Video Downloader API",
    description="API for extracting and downloading videos from various platforms using yt-dlp",
    version="1.0.0"
)

# Add limiter to app state
app.state.limiter = limiter

# Custom rate limit handler
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    retry = exc.retry_after if hasattr(exc, "retry_after") else 60
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down.",
            "retry_after": f"{retry} seconds"
        },
        headers={"Retry-After": str(retry)}
    )

app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Validation errors (422) — clean up Pydantic's verbose output
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = ".".join(str(x) for x in first.get("loc", [])[1:])
    return JSONResponse(
        status_code=422,
        content={
            "error": "validation_error",
            "message": f"Invalid input: {first.get('msg', 'unknown error')}",
            "field": field or None
        }
    )

# Generic 500 fallback — never expose stack traces
@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    # Log the full exception for internal debugging
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": "An unexpected error occurred. Please try again."
        }
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(extract.router, prefix="/api", tags=["Extract"])
app.include_router(download.router, prefix="/api", tags=["Download"])
app.include_router(status.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Create dl_jobs directory if it doesn't exist
    base_download_dir = os.path.join(os.getcwd(), "dl_jobs")
    os.makedirs(base_download_dir, exist_ok=True)
    logger.info(f"Initialized download directory: {base_download_dir}")
    
    # Start cleanup background task
    asyncio.create_task(job_store.cleanup_loop(base_download_dir))
    logger.info("Started job cleanup background task")

@app.get("/")
async def root():
    return {"message": "Video Downloader API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

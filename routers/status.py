from fastapi import APIRouter, Request
import psutil
import time
from services.job_store import job_store
from models.schemas import JobStatus
from limiter import limiter

router = APIRouter(tags=["Status"])

@router.get("/status/system")
@limiter.limit("30/minute")
async def get_system_status(request: Request):
    from main import START_TIME
    
    cpu_percent = None
    try:
        cpu_percent = psutil.cpu_percent(interval=None)
    except:
        pass
        
    ram = None
    try:
        vm = psutil.virtual_memory()
        ram = {
            "total_bytes": vm.total,
            "used_bytes": vm.used,
            "percent": vm.percent
        }
    except:
        pass
        
    disk = None
    try:
        du = psutil.disk_usage('/')
        disk = {
            "total_bytes": du.total,
            "used_bytes": du.used,
            "percent": du.percent
        }
    except:
        pass
        
    uptime_seconds = time.time() - START_TIME
    
    # Access private _jobs for counting
    jobs_dict = job_store._jobs
    active_jobs = sum(1 for j in jobs_dict.values() if j.get("status") == JobStatus.DOWNLOADING)
    queued_jobs = sum(1 for j in jobs_dict.values() if j.get("status") == JobStatus.QUEUED)
    total_completed = len(job_store.completed_downloads)
    
    return {
        "cpu_percent": cpu_percent,
        "ram": ram,
        "disk": disk,
        "uptime_seconds": uptime_seconds,
        "active_jobs": active_jobs,
        "queued_jobs": queued_jobs,
        "total_completed": total_completed
    }

@router.get("/status/downloads")
@limiter.limit("30/minute")
async def get_download_history(request: Request):
    recent = list(job_store.completed_downloads)[:20]
    
    total_size_bytes = 0
    by_platform = {}
    by_format = {}
    
    for item in job_store.completed_downloads:
        if item.size_bytes:
            total_size_bytes += item.size_bytes
        
        platform = item.source.lower()
        by_platform[platform] = by_platform.get(platform, 0) + 1
        
        fmt = item.format.lower()
        by_format[fmt] = by_format.get(fmt, 0) + 1
        
    return {
        "recent": recent,
        "stats": {
            "total_downloads": len(job_store.completed_downloads),
            "total_size_bytes": total_size_bytes,
            "by_platform": by_platform,
            "by_format": by_format
        }
    }

import asyncio
import time
import os
import shutil
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from collections import deque
from models.schemas import CompletedDownload

logger = logging.getLogger(__name__)

class JobStore:
    def __init__(self, cleanup_interval_seconds: int = 300, job_expiry_minutes: int = 4320): # 4320 minutes = 3 days
        # job_id -> job_data
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._active_downloads = 0
        self._max_concurrent = 3
        self._job_expiry_minutes = job_expiry_minutes
        self._cleanup_interval = cleanup_interval_seconds
        self._lock = asyncio.Lock()
        # History of completed downloads (last 100)
        self.completed_downloads = deque(maxlen=100)

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._jobs.get(job_id)

    async def create_job(self, job_id: str, source: str, filename: Optional[str] = None):
        async with self._lock:
            self._jobs[job_id] = {
                "job_id": job_id,
                "status": "queued",
                "progress": 0.0,
                "filename": filename,
                "size_bytes": 0,
                "source": source,
                "error": None,
                "created_at": datetime.now(),
                "completed_at": None,
                # Metadata for history tracking
                "title": None,
                "thumbnail": None,
                "format": None,
                "quality": None
            }

    async def update_job(self, job_id: str, **kwargs):
        async with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id].update(kwargs)
                if kwargs.get("status") == "completed" or kwargs.get("status") == "failed":
                    self._jobs[job_id]["completed_at"] = datetime.now()

    async def can_start_download(self) -> bool:
        async with self._lock:
            return self._active_downloads < self._max_concurrent

    async def increment_active(self):
        async with self._lock:
            self._active_downloads += 1

    async def decrement_active(self):
        async with self._lock:
            self._active_downloads = max(0, self._active_downloads - 1)

    def record_completed(self, download: CompletedDownload) -> None:
        self.completed_downloads.appendleft(download)

    async def cleanup_loop(self, base_temp_dir: str):
        """Background task to cleanup old jobs and files."""
        while True:
            try:
                await asyncio.sleep(self._cleanup_interval)
                now = datetime.now()
                expiry_delta = timedelta(minutes=self._job_expiry_minutes)
                
                to_delete = []
                async with self._lock:
                    for job_id, job in self._jobs.items():
                        if job["completed_at"] and (now - job["completed_at"]) > expiry_delta:
                            to_delete.append(job_id)
                
                for job_id in to_delete:
                    # Delete files
                    job_dir = os.path.join(base_temp_dir, job_id)
                    if os.path.exists(job_dir):
                        try:
                            shutil.rmtree(job_dir)
                            logger.info(f"Cleaned up files for job {job_id}")
                        except Exception as e:
                            logger.error(f"Error cleaning up job {job_id} files: {e}")
                    
                    # Delete from dict
                    async with self._lock:
                        if job_id in self._jobs:
                            del self._jobs[job_id]
                            logger.info(f"Cleaned up job record {job_id}")
                            
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")

# Global instance
job_store = JobStore()

def record_completed(download: CompletedDownload) -> None:
    job_store.record_completed(download)

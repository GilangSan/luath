import yt_dlp
import os
import json

url = "https://www.tiktok.com/@tiktok/video/7612095508814859528"
cookies = "tiktok_cookies.txt"

opts = {
    'quiet': True,
    'cookiefile': cookies,
    'http_headers': {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/"
    }
}

try:
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        formats = info.get('formats', [])
        for f in formats:
            print(f"ID: {f.get('format_id')}, Ext: {f.get('ext')}, Vcodec: {f.get('vcodec')}, Acodec: {f.get('acodec')}, Res: {f.get('resolution')}")
except Exception as e:
    print(f"Error: {e}")

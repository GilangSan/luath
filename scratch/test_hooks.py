import yt_dlp
import os
import asyncio

async def test_audio_download():
    url = "https://www.youtube.com/watch?v=jNQXAC9IVRw" # A short video
    output_dir = "test_dl"
    os.makedirs(output_dir, exist_ok=True)
    
    def progress_hook(d):
        print(f"Progress Hook: status={d['status']}, filename={d.get('filename')}")

    def postprocessor_hook(d):
        print(f"Postprocessor Hook: status={d['status']}")
        if d['status'] == 'finished':
             print(f"Final Info: {d.get('info_dict', {}).get('filepath')}")

    opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': f"{output_dir}/%(title)s.%(ext)s",
        'progress_hooks': [progress_hook],
        'postprocessor_hooks': [postprocessor_hook],
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    asyncio.run(test_audio_download())

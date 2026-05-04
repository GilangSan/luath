<div align="center">

```
  ██╗     ██╗   ██╗ █████╗ ████████╗██╗  ██╗
  ██║     ██║   ██║██╔══██╗╚══██╔══╝██║  ██║
  ██║     ██║   ██║███████║   ██║   ███████║
  ██║     ██║   ██║██╔══██║   ██║   ██╔══██║
  ███████╗╚██████╔╝██║  ██║   ██║   ██║  ██║
  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
```

**[ MEDIA_EXTRACTION_SYSTEM // v1.0.0 ]**

![Version](https://img.shields.io/badge/VERSION-1.0.0-primary?style=for-the-badge&labelColor=050505&color=00ffaa)
![Next.js](https://img.shields.io/badge/NEXT.JS-14-black?style=for-the-badge&logo=next.js&labelColor=050505)
![FastAPI](https://img.shields.io/badge/FASTAPI-Python-black?style=for-the-badge&logo=fastapi&labelColor=050505&color=009688)
![License](https://img.shields.io/badge/LICENSE-MIT-black?style=for-the-badge&labelColor=050505&color=ffffff)

*A high-performance media downloader with a brutalist cyber-console aesthetic.*

[**Live Demo**](#) · [**Report Bug**](#) · [**Request Feature**](#)

</div>

---

## > OVERVIEW

**Luath** is a web-based media extraction tool that lets you download videos and audio from 12+ platforms. Built with a terminal-inspired UI, it provides real-time download progress, format selection, and a client-side history log — all without requiring an account or storing your data on a server.

---

## > SUPPORTED_PLATFORMS

| Platform | Video | Audio | Notes |
|---|---|---|---|
| YouTube | ✅ | ✅ | Shorts, playlists supported |
| TikTok | ✅ | ✅ | May require cookies for some content |
| Instagram | ✅ | ✅ | Reels & video posts only |
| Twitter / X | ✅ | ✅ | |
| Facebook | ✅ | ✅ | Public videos only |
| Reddit | ✅ | ✅ | |
| Vimeo | ✅ | ✅ | |
| Twitch | ✅ | ✅ | VODs & clips |
| Dailymotion | ✅ | ✅ | |
| SoundCloud | ❌ | ✅ | Audio only |
| Bilibili | ✅ | ✅ | |
| Pinterest | ✅ | ❌ | Video pins only |

---

## > FEATURES

- **Multi-format selection** — choose resolution and format before downloading (4K, 1080p, 720p, audio-only, etc.)
- **Real-time progress** — live download progress tracking via polling
- **Download history** — stored locally in your browser, never sent to the server
- **System status page** — public monitoring page with server resource usage and recent downloads
- **Privacy-first** — no accounts, no tracking cookies, no persistent server-side storage
- **Rate limited** — built-in abuse prevention per endpoint

---

## > TECH_STACK

### Frontend
- **Next.js 14** — App Router
- **TypeScript** — strict mode
- **Tailwind CSS** — utility styling + custom design tokens

### Backend
- **FastAPI** — async Python API
- **yt-dlp** — media extraction engine
- **psutil** — system resource monitoring
- **slowapi** — rate limiting

---

## > GETTING_STARTED

### Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+
- **Python** 3.11+
- **FFmpeg** installed and available in your system PATH

```bash
# Verify all prerequisites
node -v
python --version
ffmpeg -version
```

### 01 — Clone the Repository

```bash
git clone https://github.com/yourusername/luath.git
cd luath
```

### 02 — Backend Setup

```bash
cd downloader-api
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`.
API docs available at `http://localhost:8000/docs`.

### 03 — Frontend Setup

```bash
cd downloader
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## > PROJECT_STRUCTURE

```
luath/
├── downloader/                  # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Main downloader UI
│   │   │   ├── history/         # Download history page
│   │   │   └── status/          # System status page
│   │   ├── components/          # Reusable UI components
│   │   │   └── ErrorDisplay.tsx # Terminal-style error component
│   │   ├── hooks/
│   │   │   └── useDownload.ts   # Core download flow hook
│   │   ├── lib/
│   │   │   ├── api.ts           # Typed API client
│   │   │   ├── history.ts       # localStorage history manager
│   │   │   └── error-utils.ts   # Error classification utilities
│   │   └── types/
│   │       └── index.ts         # Shared TypeScript types
│   └── public/
│
└── downloader-api/              # FastAPI backend
    ├── main.py                  # App entry point
    ├── routers/
    │   ├── extract.py           # POST /api/extract
    │   ├── download.py          # Download job endpoints
    │   └── status.py            # System status endpoints
    ├── services/
    │   ├── ytdlp_service.py     # yt-dlp integration
    │   ├── job_store.py         # In-memory job management
    │   └── error_handler.py     # Error classification
    └── models/
        └── schemas.py           # Pydantic schemas
```

---

## > API_REFERENCE

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/api/extract` | Extract metadata & available streams | 10 / min |
| `POST` | `/api/download/start` | Start a download job | 5 / min |
| `GET` | `/api/download/status/{job_id}` | Poll job progress | 60 / min |
| `GET` | `/api/download/file/{job_id}` | Download completed file | 10 / min |
| `GET` | `/api/status/system` | Server resource metrics | 30 / min |
| `GET` | `/api/status/downloads` | Recent downloads & stats | 30 / min |

Full interactive docs: `http://localhost:8000/docs`

---

## > ENVIRONMENT_VARIABLES

### Frontend (`downloader/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |

### Backend

No `.env` required for local development. Configuration is handled directly in `main.py`.

---

## > HOW_IT_WORKS

```
User inputs URL
      │
      ▼
POST /api/extract
      │  yt-dlp fetches metadata (no download)
      ▼
Returns title, thumbnail, available streams
      │
User selects format & quality
      │
      ▼
POST /api/download/start
      │  Returns job_id
      ▼
FE polls GET /api/download/status/{job_id} every 2s
      │
      ├─ downloading → update progress bar
      │
      └─ completed
            │
            ├─ Save to localStorage (history)
            └─ Trigger file download
```

---

## > LEGAL_DISCLAIMER

Luath is a tool designed to facilitate the download of publicly accessible media for **personal use only**. Users are solely responsible for ensuring their usage complies with:

- Applicable regional copyright laws
- The Terms of Service of the source platforms

Luath does not host, store, or distribute any third-party copyrighted content. The developers assume no liability for misuse of this tool.

---

## > CONTRIBUTING

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

---

<div align="center">

**[ END_OF_TRANSMISSION ]**

Made with ☕ · [Privacy Policy](#) · [Status Page](#)

</div>
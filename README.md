# LUATH.EXE // MEDIA_EXTRACTION_SYSTEM

![LUATH_BANNER](https://img.shields.io/badge/VERSION-1.0.0-primary?style=for-the-badge&labelColor=050505&color=00ffaa)

**LUATH** is a premium, high-performance media extraction utility built with a brutalist "cyber-console" aesthetic. It provides a seamless interface for extracting and downloading media from various global data clusters (YouTube, TikTok, Instagram, etc.) using a decentralized architecture.

---

## 🚀 CORE_FEATURES

- **MULTI-PLATFORM_INJECTION**: Robust support for YouTube, TikTok, Instagram, Twitter/X, Facebook, and Reddit.
- **NEURAL_TERMINAL_UI**: A state-of-the-art terminal-themed interface with glassmorphism, subtle animations, and high-contrast typography.
- **REAL_TIME_SYNC**: Live progress monitoring and packet synchronization during download cycles.
- **SECURE_BY_DESIGN**:
  - Zero persistent data storage (In-memory processing).
  - No tracking cookies or external analytics.
  - Local history persistence via `localStorage`.
- **SUPPORT_PROTOCOL**: Integrated Saweria gateway for direct resource allocation.

---

## 🛠 TECH_STACK

### FRONTEND (EXTRACT_CORE)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens
- **Icons**: Material Symbols + Official Brand SVGs

### BACKEND (EXTRACTION_DAEMON)
- **Framework**: FastAPI (Python)
- **Engine**: yt-dlp (Custom Configuration)
- **Status**: Asynchronous Job Management

---

## 📥 INSTALLATION_&_SETUP

### 01_PREREQUISITES
- Node.js 18+
- Python 3.10+
- FFmpeg (Global PATH access required)

### 02_FRONTEND_INITIALIZATION
```bash
cd downloader
npm install
npm run dev
```

### 03_BACKEND_INITIALIZATION
```bash
cd downloader-api
pip install -r requirements.txt
python main.py
```

---

## 📁 PROJECT_STRUCTURE

```text
/downloader
├── src/
│   ├── app/          # Neural routes & page modules
│   ├── components/   # UI Fragments (ErrorDisplay, SocialIcons, etc.)
│   ├── hooks/        # Reactive logic (useDownload)
│   ├── lib/          # API Handlers & history protocols
│   └── types/        # System definitions
└── public/           # Static data & static assets
```

---

## ⚖️ LEGAL_DISCLAIMER

LUATH is a tool designed to facilitate the download of publicly accessible media for personal use. Users are solely responsible for ensuring their usage complies with regional copyright laws and the terms of service of the source platforms. LUATH does not host or distribute copyrighted content.

---

## 📡 SYSTEM_STATUS

- **UPTIME**: 99.9%
- **ENCRYPTION**: TLS 1.3
- **MAINTENANCE**: ACTIVE

<div align="center">
  <p>[ END_OF_TRANSMISSION ]</p>
</div>

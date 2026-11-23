# Deployment Guide — VyaparVoice (BhashaBRD + BhashaVoice ASR)

This guide documents production deployment architecture, step-by-step hosting configuration, environment variables, and fallback resiliency for **VyaparVoice**.

---

## 1. Architecture Overview

VyaparVoice utilizes a decoupled hybrid architecture:

```
[ Browser / Client ]
        │
        ▼ (HTTPS)
[ Next.js 15 Frontend — Vercel / Node 20 ]
  ├── React 19 UI + Theme Engine + Audio Capture
  ├── LocalStorage Persistence Engine (Schema v1)
  └── Server-Side Route Handlers (/api/transcribe, /api/clarify, /api/generate-brd)
        │
        ├─── [Primary ASR: Whisper] ──────────► [ FastAPI Service — Render / Cloud ]
        │                                         ├── faster-whisper (tiny/base)
        │                                         └── CTranslate2 Int8 CPU Inference
        │
        ├─── [Alternative Indic ASR & LLM] ───► [ Sarvam AI Managed Cloud ]
        │                                         ├── Saaras v4 Indic STT
        │                                         └── Sarvam-105B Reasoning LLM
        │
        └─── [Offline / Zero-Config] ─────────► [ Deterministic Simulation Fallback ]
                                                  └── Guaranteed 12-Section BRD Output
```

---

## 2. Deploying Next.js Frontend (Vercel)

### Step 1: Connect Repository
1. Import `Mohit-Gupta1002/VyaparVoice` in your Vercel Dashboard.
2. Select Framework Preset: **Next.js**.
3. Root Directory: `./` (project root).

### Step 2: Environment Variables
Configure the following in **Settings > Environment Variables**:

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `ASR_PROVIDER` | Optional | `auto` | Provider strategy: `auto`, `whisper`, `sarvam`, or `demo` |
| `WHISPER_API_URL` | Optional | `https://your-backend.onrender.com/api/speech/transcribe` | URL of FastAPI Whisper service |
| `SARVAM_API_KEY` | Optional | `your_sarvam_key` | Sarvam AI key for live Indic STT and LLM |
| `SARVAM_CHAT_MODEL` | Optional | `sarvam-105b` | Model name for clarification & BRD prompts |
| `SARVAM_STT_MODEL` | Optional | `saaras:v4` | Indic speech model name |

> [!NOTE]
> If neither `WHISPER_API_URL` nor `SARVAM_API_KEY` is configured, VyaparVoice automatically runs in **Deterministic Demo Mode**. The deployment will build and serve instantly without failing or crashing.

### Step 3: Security Headers
Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`) are pre-configured in `vercel.json`.

---

## 3. Deploying Python FastAPI Backend (Render)

### Step 1: Create Web Service from Blueprint
The repository contains a declarative `render.yaml` specification.
1. In Render Dashboard, click **New > Blueprint**.
2. Select repository `VyaparVoice`.
3. Render automatically reads `render.yaml` and sets up `vyaparvoice-whisper-backend`.

### Step 2: Manual Web Service Setup (Alternative)
If not using Blueprints:
- **Environment**: Python 3.11
- **Root Directory**: `backend`
- **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
- **Health Check Path**: `/api/speech/health`

### Step 3: Backend Environment Variables
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `FASTAPI_ENV` | `production` | Production environment flag |
| `WHISPER_MODEL_SIZE` | `tiny` | Smallest footprint (39M params, int8 quantized) |
| `WHISPER_DEVICE` | `cpu` | Uses CPU with CTranslate2 optimization |
| `WHISPER_COMPUTE_TYPE` | `int8` | Fast, low-memory inference |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` | Whitelisted frontend origins |

---

## 4. Verification & Health Monitoring

### Backend Health Check
```bash
curl -X GET https://your-backend.onrender.com/api/speech/health
```
Expected response:
```json
{
  "status": "ok",
  "app": "BhashaVoice AI",
  "engine": "Speech AI Research Engine",
  "whisper_model": "tiny",
  "whisper_loaded": false,
  "sarvam_configured": false
}
```
*(Note: `whisper_loaded` starts `false` because models are loaded lazily on first audio request to conserve resources).*

### Frontend Health Check
```bash
curl -X GET https://your-app.vercel.app/api/health
```
Expected response:
```json
{
  "status": "ok",
  "app": "VyaparVoice",
  "engine": "BhashaBRD",
  "isDemo": true,
  "sarvamConfigured": false,
  "whisperConfigured": true,
  "whisperUrl": "https://your-backend.onrender.com/api/speech/transcribe",
  "asrProvider": "auto"
}
```

---

## 5. Resiliency & Fallback Guarantees

1. **Whisper Timeout / Failure**: If the FastAPI backend is down or exceeds 45s, the Next.js route handler catches the exception, logs a warning, and attempts the configured Sarvam API.
2. **Sarvam Failure**: If Sarvam responds with rate limits (429) or is not configured, the engine falls back seamlessly to deterministic demo mode.
3. **No Downtime for Demonstrations**: Recruiters and evaluators can interact with the app end-to-end even if cloud microservices are sleeping or cold-starting.

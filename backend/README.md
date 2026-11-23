# BhashaVoice AI — Speech AI Research Backend

> **FastAPI Speech Recognition & Indic Multilingual Research Prototype**  
> Powered by `faster-whisper`, CTranslate2, and modular Indic speech processing pipelines.

---

## 🌟 Overview

The **BhashaVoice AI Backend** is a standalone, lightweight, high-performance Python FastAPI service engineered for speech AI research, transcription benchmarking, and audio feature extraction. It operates independently from the Next.js frontend, providing standardized REST APIs for speech-to-text inference with lazy model loading and segment-level timestamping.

---

## 🚀 Key Features (Phase 1)

1. **`POST /api/speech/transcribe` Endpoint**:
   - Accepts multi-format audio uploads (`.wav`, `.mp3`, `.m4a`, `.webm`, `.ogg`, `.flac`, `.aac`).
   - Supports explicit Indic language codes (`hi`, `en`, `mr`, `ta`, `te`, `bn`, `gu`, `kn`, `ml`, `pa`, `or`) or automatic language detection (`unknown`, `auto`, or omitted).
   - Configurable beam size decoding (1 to 10).

2. **Strict Audio Validation**:
   - Enforces 25MB maximum upload limit (`HTTP 413 Payload Too Large`).
   - Validates file extensions and audio MIME types (`HTTP 400 Bad Request`).
   - Validates non-empty file buffers.

3. **Lazy `faster-whisper` Model Loading**:
   - The model is **not loaded at application startup**, keeping server boot time under 500ms.
   - Initialized as a cached thread-safe singleton on first inference request.
   - Configured with the lightweight `tiny` model (~75MB) by default to prevent large automated model downloads.
   - Easily configurable to `base`, `small`, `medium`, or `large-v3` via environment variables.

4. **Segment-Level Timestamps & Confidence**:
   - Outputs fine-grained speech segments containing `start` and `end` timestamps in seconds.
   - Includes average log probability (`avg_logprob`) and silence probability (`no_speech_prob`).

5. **Latency Benchmarking**:
   - Records high-resolution end-to-end inference processing time (`processing_time_ms`).
   - Captures audio duration and language detection confidence probability (`language_probability`).

6. **Comprehensive Error Handling**:
   - Structured JSON error responses (`error`, `status_code`, `detail`).
   - Graceful capture of corrupted audio streams or unsupported codecs.

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app, CORS, exception handlers, routing
│   ├── config.py                   # Pydantic BaseSettings (.env loading)
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── speech.py           # POST /api/speech/transcribe endpoint
│   │       └── health.py           # GET /api/health endpoint
│   ├── services/
│   │   ├── __init__.py
│   │   ├── audio_validator.py      # File format, size, and content validation
│   │   └── whisper_service.py      # Lazy faster-whisper loader & transcription
│   └── schemas/
│       ├── __init__.py
│       └── speech.py               # Pydantic models for transcription & health
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures and TestClient
│   ├── test_health.py              # Health check endpoint tests
│   ├── test_validation.py          # Audio validation test suite
│   └── test_transcribe.py          # Transcription endpoint & error handling tests
├── .env.example                    # Environment variable template
├── requirements.txt                # Python package manifest
├── run.py                          # Development launcher
└── README.md                       # Backend documentation
```

---

## ⚙️ Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` to configure:

```env
# Server
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
FASTAPI_ENV=development

# CORS
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# Whisper Model (faster-whisper)
WHISPER_MODEL_SIZE=tiny
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8

# Audio Limits (25 MB)
MAX_AUDIO_SIZE_BYTES=26214400

# Optional Sarvam AI
SARVAM_API_KEY=
SARVAM_BASE_URL=https://api.sarvam.ai
```

---

## 🏃 Quickstart & Running the Backend

### 1. Create Virtual Environment
```bash
# Windows
python -m venv backend/venv
backend\venv\Scripts\activate

# Linux / macOS
python3 -m venv backend/venv
source backend/venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Start Development Server
```bash
python backend/run.py
```
Or directly with Uvicorn:
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive API documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Running Python Tests

Execute the test suite with `pytest`:

```bash
# Windows
backend\venv\Scripts\pytest backend/tests -v

# Linux / macOS
pytest backend/tests -v
```

---

## 📡 API Reference

### 1. `POST /api/speech/transcribe`

Transcribes an uploaded audio file.

#### Request (Multipart Form Data):
- `file` (binary, required): Audio file (`.wav`, `.mp3`, `.m4a`, `.webm`, etc.).
- `language` (string, optional): ISO code (e.g. `hi`, `en`, `mr`) or Indic code (`hi-IN`). If omitted, language is detected automatically.
- `beam_size` (integer, optional, default: 5): Beam search size.

#### Example cURL:
```bash
curl -X POST "http://localhost:8000/api/speech/transcribe" \
  -F "file=@voice_note.wav" \
  -F "language=hi"
```

#### Successful Response (`200 OK`):
```json
{
  "transcript": "मैं एक क्लिनिक के लिए अपॉइंटमेंट सिस्टम बनाना चाहता हूँ",
  "language_code": "hi",
  "language_probability": 0.985,
  "duration_seconds": 4.12,
  "processing_time_ms": 312.45,
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 4.12,
      "text": "मैं एक क्लिनिक के लिए अपॉइंटमेंट सिस्टम बनाना चाहता हूँ",
      "avg_logprob": -0.215,
      "no_speech_prob": 0.012
    }
  ],
  "model_used": "faster-whisper:tiny"
}
```

#### Error Response (`400 Bad Request` or `413 Payload Too Large`):
```json
{
  "error": "Unsupported audio format '.txt'. Supported formats: .aac, .flac, .m4a, .mp3, .ogg, .wav, .webm",
  "status_code": 400
}
```

### 2. `GET /api/health`

Returns service health, configuration, and whether the Whisper model has been lazily loaded into memory.

#### Example Response (`200 OK`):
```json
{
  "status": "ok",
  "app": "BhashaVoice AI",
  "engine": "Speech AI Research Engine",
  "whisper_model": "tiny",
  "whisper_loaded": false,
  "sarvam_configured": false,
  "timestamp": "2026-10-31T15:20:00.000000+00:00"
}
```


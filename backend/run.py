#!/usr/bin/env python
"""Development launcher for BhashaVoice AI FastAPI backend."""

import uvicorn
from backend.app.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    print("=" * 60)
    print("  Starting BhashaVoice AI - Speech AI Research Backend")
    print(f"  Host: http://{settings.FASTAPI_HOST}:{settings.FASTAPI_PORT}")
    print(f"  Docs: http://localhost:{settings.FASTAPI_PORT}/docs")
    print(f"  Whisper Model: {settings.WHISPER_MODEL_SIZE} (Loaded Lazily)")
    print("=" * 60)
    uvicorn.run(
        "backend.app.main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=True,
    )


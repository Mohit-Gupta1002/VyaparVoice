from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.config import get_settings
from backend.app.schemas.speech import HealthResponse
from backend.app.services.whisper_service import is_whisper_model_loaded

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the health status, lazy model loading status, and configuration details.",
)
async def health_check() -> HealthResponse:
    """System health check endpoint."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app="BhashaVoice AI",
        engine="Speech AI Research Engine",
        whisper_model=settings.WHISPER_MODEL_SIZE,
        whisper_loaded=is_whisper_model_loaded(),
        sarvam_configured=bool(settings.SARVAM_API_KEY and settings.SARVAM_API_KEY.strip()),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


import logging
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile, status
from backend.app.schemas.speech import TranscriptionResponse
from backend.app.services.audio_validator import validate_audio_upload
from backend.app.services.whisper_service import transcribe_audio_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/speech", tags=["Speech"])


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Transcribe audio using faster-whisper",
    description="Accepts an audio file, validates its format and size, and transcribes speech with automatic language detection, segment timestamps, and processing latency.",
)
async def transcribe_speech(
    file: UploadFile = File(..., description="Audio file to transcribe (.wav, .mp3, .m4a, .webm, .ogg, .flac, .aac)"),
    language: Optional[str] = Form(
        None,
        description="Optional language code (e.g. 'hi', 'en', 'mr', 'hi-IN'). If omitted or 'unknown'/'auto', language is automatically detected.",
    ),
    beam_size: int = Form(
        5,
        ge=1,
        le=10,
        description="Beam size for decoding (default: 5)",
    ),
) -> TranscriptionResponse:
    """Endpoint for audio file validation and faster-whisper transcription."""
    # 1. Audio validation
    audio_bytes = await validate_audio_upload(file)

    # 2. Transcription with faster-whisper
    result = transcribe_audio_bytes(
        audio_data=audio_bytes,
        language=language,
        beam_size=beam_size,
    )

    return result


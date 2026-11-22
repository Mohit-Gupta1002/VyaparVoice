import io
import logging
import time
from typing import Optional, Union
from fastapi import HTTPException, status
from faster_whisper import WhisperModel
from backend.app.config import get_settings
from backend.app.schemas.speech import TranscriptionResponse, TranscriptionSegment

logger = logging.getLogger(__name__)

# Lazy singleton model reference
_whisper_model: Optional[WhisperModel] = None

# Language mapping from Indic BCP-47 codes to Whisper ISO 639-1 codes
LANGUAGE_MAP = {
    "hi-in": "hi",
    "en-in": "en",
    "mr-in": "mr",
    "ta-in": "ta",
    "te-in": "te",
    "bn-in": "bn",
    "gu-in": "gu",
    "kn-in": "kn",
    "ml-in": "ml",
    "pa-in": "pa",
    "od-in": "or",  # Odia in Whisper is 'or'
    "unknown": None,
    "auto": None,
}


def is_whisper_model_loaded() -> bool:
    """Return True if the Whisper model is currently loaded in memory."""
    global _whisper_model
    return _whisper_model is not None


def get_whisper_model() -> WhisperModel:
    """Lazily load and return the cached WhisperModel singleton.

    Does not load on application startup; loads only when first requested.
    Uses model size specified in settings (default 'tiny').
    """
    global _whisper_model
    if _whisper_model is None:
        settings = get_settings()
        logger.info(
            f"Lazily loading faster-whisper model '{settings.WHISPER_MODEL_SIZE}' "
            f"on device '{settings.WHISPER_DEVICE}' with compute_type '{settings.WHISPER_COMPUTE_TYPE}'..."
        )
        try:
            _whisper_model = WhisperModel(
                model_size_or_path=settings.WHISPER_MODEL_SIZE,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE,
                download_root=settings.WHISPER_DOWNLOAD_ROOT,
            )
            logger.info(f"faster-whisper model '{settings.WHISPER_MODEL_SIZE}' loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load faster-whisper model: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize speech recognition model: {str(e)}",
            )
    return _whisper_model


def normalize_language_code(lang: Optional[str]) -> Optional[str]:
    """Normalize language code to ISO 639-1 for Whisper."""
    if not lang:
        return None
    cleaned = lang.strip().lower()
    if cleaned in LANGUAGE_MAP:
        return LANGUAGE_MAP[cleaned]
    # If 2-letter code already (e.g. "hi", "en"), pass through
    if len(cleaned) == 2:
        return cleaned
    return None


def transcribe_audio_bytes(
    audio_data: Union[bytes, io.BytesIO],
    language: Optional[str] = None,
    beam_size: int = 5,
) -> TranscriptionResponse:
    """Transcribe audio bytes using faster-whisper.

    Features:
    - Lazy model loading
    - Automatic language detection when language is not provided or 'unknown'
    - Segment-level timestamps (start, end)
    - Total processing time in milliseconds
    """
    settings = get_settings()
    model = get_whisper_model()
    target_language = normalize_language_code(language)

    if isinstance(audio_data, bytes):
        audio_stream = io.BytesIO(audio_data)
    else:
        audio_stream = audio_data

    start_perf = time.perf_counter()

    try:
        segments_gen, info = model.transcribe(
            audio_stream,
            beam_size=beam_size,
            language=target_language,
            vad_filter=True,
        )

        segments = []
        full_text_parts = []

        for seg in segments_gen:
            clean_text = seg.text.strip()
            if clean_text:
                segments.append(
                    TranscriptionSegment(
                        id=seg.id,
                        start=round(float(seg.start), 2),
                        end=round(float(seg.end), 2),
                        text=clean_text,
                        avg_logprob=round(float(seg.avg_logprob), 3)
                        if seg.avg_logprob is not None
                        else None,
                        no_speech_prob=round(float(seg.no_speech_prob), 3)
                        if seg.no_speech_prob is not None
                        else None,
                    )
                )
                full_text_parts.append(clean_text)

        full_transcript = " ".join(full_text_parts).strip()
        elapsed_ms = round((time.perf_counter() - start_perf) * 1000, 2)

        return TranscriptionResponse(
            transcript=full_transcript,
            language_code=info.language or "unknown",
            language_probability=round(float(info.language_probability), 3)
            if info.language_probability is not None
            else None,
            duration_seconds=round(float(info.duration), 2)
            if info.duration is not None
            else None,
            processing_time_ms=elapsed_ms,
            segments=segments,
            model_used=f"faster-whisper:{settings.WHISPER_MODEL_SIZE}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to decode or transcribe audio stream: {str(e)}",
        )


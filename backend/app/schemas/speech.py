from typing import List, Optional
from pydantic import BaseModel, Field


class TranscriptionSegment(BaseModel):
    """Timestamped segment from transcription."""

    id: int = Field(..., description="Segment sequential identifier")
    start: float = Field(..., description="Start timestamp in seconds")
    end: float = Field(..., description="End timestamp in seconds")
    text: str = Field(..., description="Transcribed text for this segment")
    avg_logprob: Optional[float] = Field(
        None, description="Average log probability of the segment"
    )
    no_speech_prob: Optional[float] = Field(
        None, description="Probability that the segment contains no speech"
    )


class TranscriptionResponse(BaseModel):
    """Speech-to-text response containing transcript, segments, and metadata."""

    transcript: str = Field(..., description="Full consolidated transcript")
    language_code: str = Field(
        ..., description="Detected or specified ISO 639-1 language code (e.g., 'hi', 'en', 'mr')"
    )
    language_probability: Optional[float] = Field(
        None, description="Confidence probability of language detection (0.0 to 1.0)"
    )
    duration_seconds: Optional[float] = Field(
        None, description="Audio duration in seconds"
    )
    processing_time_ms: float = Field(
        ..., description="Transcription processing time in milliseconds"
    )
    segments: List[TranscriptionSegment] = Field(
        default_factory=list, description="Timestamped segments"
    )
    model_used: str = Field(..., description="Model identifier used for transcription")


class HealthResponse(BaseModel):
    """System health check response schema."""

    status: str = "ok"
    app: str = "BhashaVoice AI"
    engine: str = "Speech AI Research Engine"
    whisper_model: str
    whisper_loaded: bool
    sarvam_configured: bool
    timestamp: str


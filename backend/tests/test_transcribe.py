from typing import NamedTuple, Optional
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from backend.app.services.whisper_service import (
    normalize_language_code,
    transcribe_audio_bytes,
)


class MockSegment(NamedTuple):
    id: int
    start: float
    end: float
    text: str
    avg_logprob: Optional[float] = -0.15
    no_speech_prob: Optional[float] = 0.02


class MockTranscriptionInfo(NamedTuple):
    language: str
    language_probability: float
    duration: float


def test_language_code_normalization():
    """Verify BCP-47 Indic language codes correctly map to Whisper ISO codes."""
    assert normalize_language_code("hi-IN") == "hi"
    assert normalize_language_code("en-IN") == "en"
    assert normalize_language_code("mr-IN") == "mr"
    assert normalize_language_code("ta-IN") == "ta"
    assert normalize_language_code("te-IN") == "te"
    assert normalize_language_code("bn-IN") == "bn"
    assert normalize_language_code("gu-IN") == "gu"
    assert normalize_language_code("kn-IN") == "kn"
    assert normalize_language_code("ml-IN") == "ml"
    assert normalize_language_code("pa-IN") == "pa"
    assert normalize_language_code("od-IN") == "or"
    assert normalize_language_code("unknown") is None
    assert normalize_language_code("auto") is None
    assert normalize_language_code("") is None
    assert normalize_language_code(None) is None
    assert normalize_language_code("hi") == "hi"


def test_transcribe_audio_bytes_mock(monkeypatch, valid_wav_bytes):
    """Test transcribe_audio_bytes parsing segments, timestamps, and latency."""
    # Create mock segments generator and info
    mock_segments = [
        MockSegment(id=0, start=0.0, end=1.5, text="नमस्ते दुनिया"),
        MockSegment(id=1, start=1.5, end=3.0, text="व्यापारवॉइस में आपका स्वागत है"),
    ]
    mock_info = MockTranscriptionInfo(
        language="hi",
        language_probability=0.99,
        duration=3.0,
    )

    mock_model = MagicMock()
    mock_model.transcribe.return_value = (iter(mock_segments), mock_info)

    # Patch get_whisper_model to return mock
    import backend.app.services.whisper_service as ws
    monkeypatch.setattr(ws, "get_whisper_model", lambda: mock_model)

    result = transcribe_audio_bytes(valid_wav_bytes, language="hi-IN")

    assert result.transcript == "नमस्ते दुनिया व्यापारवॉइस में आपका स्वागत है"
    assert result.language_code == "hi"
    assert result.language_probability == 0.99
    assert result.duration_seconds == 3.0
    assert result.processing_time_ms >= 0.0
    assert len(result.segments) == 2
    assert result.segments[0].start == 0.0
    assert result.segments[0].end == 1.5
    assert result.segments[0].text == "नमस्ते दुनिया"
    assert result.segments[1].start == 1.5
    assert result.segments[1].end == 3.0
    assert "faster-whisper" in result.model_used


def test_endpoint_transcribe_success(client: TestClient, monkeypatch, valid_wav_bytes):
    """Test full POST /api/speech/transcribe HTTP endpoint with mock engine."""
    mock_segments = [
        MockSegment(id=0, start=0.0, end=2.0, text="Clinic appointment queue system"),
    ]
    mock_info = MockTranscriptionInfo(
        language="en",
        language_probability=0.98,
        duration=2.0,
    )

    mock_model = MagicMock()
    mock_model.transcribe.return_value = (iter(mock_segments), mock_info)

    import backend.app.services.whisper_service as ws
    monkeypatch.setattr(ws, "get_whisper_model", lambda: mock_model)

    files = {"file": ("clinic_idea.wav", valid_wav_bytes, "audio/wav")}
    data = {"language": "en-IN", "beam_size": "5"}

    response = client.post("/api/speech/transcribe", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()

    assert res_data["transcript"] == "Clinic appointment queue system"
    assert res_data["language_code"] == "en"
    assert res_data["language_probability"] == 0.98
    assert res_data["duration_seconds"] == 2.0
    assert res_data["processing_time_ms"] > 0
    assert len(res_data["segments"]) == 1
    assert res_data["segments"][0]["text"] == "Clinic appointment queue system"
    assert res_data["segments"][0]["start"] == 0.0
    assert res_data["segments"][0]["end"] == 2.0


def test_endpoint_transcribe_error_handling(client: TestClient, monkeypatch, valid_wav_bytes):
    """Test error handling when transcription fails."""
    mock_model = MagicMock()
    mock_model.transcribe.side_effect = RuntimeError("Corrupted audio frame decoding error")

    import backend.app.services.whisper_service as ws
    monkeypatch.setattr(ws, "get_whisper_model", lambda: mock_model)

    files = {"file": ("corrupt.wav", valid_wav_bytes, "audio/wav")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 400
    res_data = response.json()
    assert "Unable to decode or transcribe audio stream" in res_data["error"]


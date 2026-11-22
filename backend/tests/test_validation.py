import pytest
from fastapi.testclient import TestClient
from backend.app.config import get_settings
from backend.app.services.audio_validator import SUPPORTED_AUDIO_EXTENSIONS


def test_reject_unsupported_audio_extension(client: TestClient):
    """Ensure non-audio extensions are rejected with 400 Bad Request."""
    files = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "Unsupported audio format" in data["error"]


def test_reject_text_file(client: TestClient):
    """Ensure plain text files are rejected with 400 Bad Request."""
    files = {"file": ("notes.txt", b"plain text notes", "text/plain")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "Unsupported audio format" in data["error"] or "Invalid content type" in data["error"]


def test_reject_invalid_mime_type(client: TestClient):
    """Ensure non-audio MIME types (like image/png) are rejected."""
    files = {"file": ("audio.wav", b"fake audio data", "image/png")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "Invalid content type" in data["error"]


def test_reject_empty_audio_file(client: TestClient):
    """Ensure 0-byte audio file is rejected with 400 Bad Request."""
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "empty" in data["error"].lower()


def test_missing_file_payload(client: TestClient):
    """Ensure missing file field returns 422 Unprocessable Entity."""
    response = client.post("/api/speech/transcribe", data={"language": "hi"})
    assert response.status_code == 422


def test_reject_oversized_audio_file(client: TestClient, monkeypatch):
    """Ensure audio file exceeding max limit returns 413 Payload Too Large."""
    settings = get_settings()
    # Temporarily set max audio size to 100 bytes for testing
    monkeypatch.setattr(settings, "MAX_AUDIO_SIZE_BYTES", 100)

    files = {"file": ("oversized.wav", b"x" * 200, "audio/wav")}
    response = client.post("/api/speech/transcribe", files=files)
    assert response.status_code == 413
    data = response.json()
    assert "exceeds maximum size limit" in data["error"]


def test_supported_audio_extensions_list():
    """Ensure all required audio formats are supported."""
    for ext in [".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac", ".aac"]:
        assert ext in SUPPORTED_AUDIO_EXTENSIONS

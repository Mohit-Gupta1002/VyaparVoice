import io
import math
import struct
import wave
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def valid_wav_bytes() -> bytes:
    """Generate a clean, valid 1-second 16kHz mono 16-bit PCM WAV file in memory."""
    buf = io.BytesIO()
    sample_rate = 16000
    duration_s = 1.0
    frequency_hz = 440.0
    total_samples = int(sample_rate * duration_s)

    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        # Generate simple sine wave
        for i in range(total_samples):
            value = int(32767.0 * 0.3 * math.sin(2.0 * math.pi * frequency_hz * (i / sample_rate)))
            wav_file.writeframes(struct.pack("<h", value))

    buf.seek(0)
    return buf.read()


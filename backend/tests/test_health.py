from fastapi.testclient import TestClient
from backend.app.config import get_settings


def test_health_root_endpoint(client: TestClient):
    """Test the /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "BhashaVoice AI"
    assert data["engine"] == "Speech AI Research Engine"
    assert "whisper_model" in data
    assert "whisper_loaded" in data
    assert "timestamp" in data


def test_health_api_endpoint(client: TestClient):
    """Test the /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "BhashaVoice AI"


def test_root_metadata_endpoint(client: TestClient):
    """Test the / landing metadata endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "BhashaVoice AI"
    assert "endpoints" in data
    assert data["endpoints"]["transcribe"] == "POST /api/speech/transcribe"


def test_health_sarvam_status(client: TestClient, monkeypatch):
    """Test health reports sarvam_configured accurately."""
    settings = get_settings()

    monkeypatch.setattr(settings, "SARVAM_API_KEY", "")
    res1 = client.get("/api/health")
    assert res1.json()["sarvam_configured"] is False

    monkeypatch.setattr(settings, "SARVAM_API_KEY", "test_key_123")
    res2 = client.get("/api/health")
    assert res2.json()["sarvam_configured"] is True

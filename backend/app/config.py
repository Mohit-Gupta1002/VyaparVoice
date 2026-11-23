from functools import lru_cache
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """Application settings with environment variable loading."""

    # Server configuration
    FASTAPI_HOST: str = "0.0.0.0"
    FASTAPI_PORT: int = 8000
    FASTAPI_ENV: str = "development"

    # CORS origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # faster-whisper configuration (loaded lazily)
    WHISPER_MODEL_SIZE: str = "tiny"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"
    WHISPER_DOWNLOAD_ROOT: Optional[str] = None

    # Audio limits
    MAX_AUDIO_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB

    # Optional Sarvam AI Integration
    SARVAM_API_KEY: Optional[str] = None
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton instance of Settings."""
    return Settings()


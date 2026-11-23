import os
from fastapi import HTTPException, UploadFile, status
from backend.app.config import get_settings

SUPPORTED_AUDIO_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".m4a",
    ".webm",
    ".ogg",
    ".flac",
    ".aac",
}

SUPPORTED_MIME_PREFIXES = ("audio/", "application/octet-stream", "video/webm")


async def validate_audio_upload(file: UploadFile) -> bytes:
    """Validate uploaded audio file for size, format, and content.

    Returns the raw audio bytes upon successful validation.
    """
    settings = get_settings()

    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file provided in request.",
        )

    # Validate file extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported audio format '{ext}'. "
                f"Supported formats: {', '.join(sorted(SUPPORTED_AUDIO_EXTENSIONS))}"
            ),
        )

    # Validate content type if provided
    content_type = (file.content_type or "").lower()
    if content_type and not any(content_type.startswith(prefix) for prefix in SUPPORTED_MIME_PREFIXES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type '{file.content_type}'. Must be an audio file.",
        )

    # Read content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded audio file: {str(e)}",
        )

    # Validate non-empty
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is empty (0 bytes).",
        )

    # Validate file size
    if len(content) > settings.MAX_AUDIO_SIZE_BYTES:
        max_mb = settings.MAX_AUDIO_SIZE_BYTES / (1024 * 1024)
        status_code = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)
        raise HTTPException(
            status_code=status_code,
            detail=f"Audio file exceeds maximum size limit of {max_mb:.0f}MB.",
        )

    return content

import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import get_settings
from backend.app.api.v1 import v1_router
from backend.app.api.v1.health import health_check

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bhashavoice")

settings = get_settings()

app = FastAPI(
    title="BhashaVoice AI - Speech AI Research Prototype",
    description=(
        "Research prototype for multilingual Indic speech recognition, "
        "faster-whisper inference, and requirements engineering."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Format HTTP exceptions into clean JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unhandled server exceptions."""
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An internal server error occurred while processing the request.",
            "detail": str(exc) if settings.FASTAPI_ENV == "development" else None,
            "status_code": 500,
        },
    )


# Mount routers:
# User requested POST /api/speech/transcribe
app.include_router(v1_router, prefix="/api")

# Direct root health endpoint
app.get("/health", tags=["Health"], include_in_schema=False)(health_check)


@app.get("/", tags=["Root"])
async def root():
    """Service landing endpoint with API metadata."""
    return {
        "app": "BhashaVoice AI",
        "description": "Multilingual Speech AI Research Prototype",
        "version": "0.1.0",
        "endpoints": {
            "transcribe": "POST /api/speech/transcribe",
            "health": "GET /api/health",
            "docs": "GET /docs",
        },
        "model": f"faster-whisper:{settings.WHISPER_MODEL_SIZE}",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=True,
    )


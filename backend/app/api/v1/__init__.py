from fastapi import APIRouter
from backend.app.api.v1.speech import router as speech_router
from backend.app.api.v1.health import router as health_router

v1_router = APIRouter()
v1_router.include_router(speech_router)
v1_router.include_router(health_router)

__all__ = ["v1_router"]


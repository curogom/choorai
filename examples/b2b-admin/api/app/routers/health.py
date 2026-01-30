from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """서버 상태 확인 엔드포인트"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc),
        version=settings.version,
    )

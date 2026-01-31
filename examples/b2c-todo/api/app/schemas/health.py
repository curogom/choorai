from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health Check 응답 스키마"""

    status: Literal["ok", "degraded"]
    timestamp: datetime
    version: str

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """프로젝트 공통 필드"""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class ProjectCreate(ProjectBase):
    """프로젝트 생성 요청"""

    pass


class ProjectUpdate(BaseModel):
    """프로젝트 수정 요청 (모든 필드 선택적)"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class ProjectResponse(ProjectBase):
    """프로젝트 응답"""

    id: str
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    """프로젝트 목록 응답"""

    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int

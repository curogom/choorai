from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TodoBase(BaseModel):
    """Todo 공통 필드"""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: bool = False


class TodoCreate(TodoBase):
    """Todo 생성 요청"""

    pass


class TodoUpdate(BaseModel):
    """Todo 수정 요청 (모든 필드 선택적)"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: Optional[bool] = None


class TodoResponse(TodoBase):
    """Todo 응답"""

    id: str
    created_at: datetime
    updated_at: datetime


class TodoListResponse(BaseModel):
    """Todo 목록 응답"""

    items: list[TodoResponse]
    total: int
    page: int
    page_size: int

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.todo import (
    TodoCreate,
    TodoListResponse,
    TodoResponse,
    TodoUpdate,
)
from app.storage import todo_storage

router = APIRouter(prefix="/api/v1/todos", tags=["Todos"])


@router.get("", response_model=TodoListResponse)
def list_todos(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
) -> TodoListResponse:
    """Todo 목록 조회 (필터링 지원)"""
    items, total = todo_storage.list(page=page, page_size=page_size, completed=completed)
    return TodoListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=TodoResponse, status_code=201)
def create_todo(data: TodoCreate) -> TodoResponse:
    """Todo 생성"""
    return todo_storage.create(data)


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: str) -> TodoResponse:
    """Todo 상세 조회"""
    todo = todo_storage.get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: str, data: TodoUpdate) -> TodoResponse:
    """Todo 수정"""
    todo = todo_storage.update(todo_id, data)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: str) -> None:
    """Todo 삭제"""
    if not todo_storage.delete(todo_id):
        raise HTTPException(status_code=404, detail="Todo not found")

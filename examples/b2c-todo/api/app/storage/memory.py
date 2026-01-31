from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate


class TodoStorage:
    """In-memory Todo 저장소"""

    def __init__(self) -> None:
        self._todos: dict[str, TodoResponse] = {}

    def create(self, data: TodoCreate) -> TodoResponse:
        """Todo 생성"""
        now = datetime.now(timezone.utc)
        todo = TodoResponse(
            id=str(uuid4()),
            title=data.title,
            description=data.description,
            is_completed=data.is_completed,
            created_at=now,
            updated_at=now,
        )
        self._todos[todo.id] = todo
        return todo

    def get(self, todo_id: str) -> Optional[TodoResponse]:
        """Todo 조회"""
        return self._todos.get(todo_id)

    def list(
        self,
        page: int = 1,
        page_size: int = 10,
        completed: Optional[bool] = None,
    ) -> tuple[list[TodoResponse], int]:
        """Todo 목록 조회 (페이지네이션 + 필터링)"""
        all_todos = list(self._todos.values())

        # 완료 상태로 필터링
        if completed is not None:
            all_todos = [t for t in all_todos if t.is_completed == completed]

        # 최신순 정렬
        all_todos.sort(key=lambda t: t.created_at, reverse=True)

        total = len(all_todos)
        start = (page - 1) * page_size
        end = start + page_size

        return all_todos[start:end], total

    def update(self, todo_id: str, data: TodoUpdate) -> Optional[TodoResponse]:
        """Todo 수정"""
        todo = self._todos.get(todo_id)
        if not todo:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return todo

        updated = todo.model_copy(
            update={
                **update_data,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self._todos[todo_id] = updated
        return updated

    def delete(self, todo_id: str) -> bool:
        """Todo 삭제"""
        if todo_id not in self._todos:
            return False
        del self._todos[todo_id]
        return True


# 싱글톤 인스턴스
todo_storage = TodoStorage()

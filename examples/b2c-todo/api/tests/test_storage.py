from app.schemas.todo import TodoCreate, TodoUpdate
from app.storage.memory import TodoStorage


class TestTodoStorage:
    """TodoStorage 단위 테스트"""

    def test_create_todo(self):
        """Todo 생성"""
        storage = TodoStorage()
        data = TodoCreate(title="Test Todo")

        todo = storage.create(data)

        assert todo.title == "Test Todo"
        assert todo.id is not None
        assert todo.is_completed is False

    def test_get_todo(self):
        """Todo 조회"""
        storage = TodoStorage()
        created = storage.create(TodoCreate(title="Test"))

        todo = storage.get(created.id)

        assert todo is not None
        assert todo.id == created.id

    def test_get_nonexistent_todo(self):
        """존재하지 않는 Todo 조회"""
        storage = TodoStorage()

        todo = storage.get("nonexistent-id")

        assert todo is None

    def test_list_todos_pagination(self):
        """Todo 목록 페이지네이션"""
        storage = TodoStorage()
        for i in range(15):
            storage.create(TodoCreate(title=f"Todo {i}"))

        items, total = storage.list(page=1, page_size=10)
        assert len(items) == 10
        assert total == 15

        items, total = storage.list(page=2, page_size=10)
        assert len(items) == 5

    def test_list_todos_filter_completed(self):
        """Todo 목록 완료 상태 필터링"""
        storage = TodoStorage()
        storage.create(TodoCreate(title="Todo 1", is_completed=False))
        storage.create(TodoCreate(title="Todo 2", is_completed=True))
        storage.create(TodoCreate(title="Todo 3", is_completed=False))

        # 전체
        items, total = storage.list()
        assert total == 3

        # 완료된 것만
        items, total = storage.list(completed=True)
        assert total == 1
        assert items[0].title == "Todo 2"

        # 미완료만
        items, total = storage.list(completed=False)
        assert total == 2

    def test_update_todo(self):
        """Todo 수정"""
        storage = TodoStorage()
        created = storage.create(TodoCreate(title="Original"))

        updated = storage.update(created.id, TodoUpdate(title="Updated"))

        assert updated is not None
        assert updated.title == "Updated"
        assert updated.updated_at > created.updated_at

    def test_update_todo_completion(self):
        """Todo 완료 상태 변경"""
        storage = TodoStorage()
        created = storage.create(TodoCreate(title="Test", is_completed=False))

        updated = storage.update(created.id, TodoUpdate(is_completed=True))

        assert updated is not None
        assert updated.is_completed is True

    def test_update_nonexistent_todo(self):
        """존재하지 않는 Todo 수정"""
        storage = TodoStorage()

        result = storage.update("nonexistent", TodoUpdate(title="Test"))

        assert result is None

    def test_delete_todo(self):
        """Todo 삭제"""
        storage = TodoStorage()
        created = storage.create(TodoCreate(title="To Delete"))

        result = storage.delete(created.id)

        assert result is True
        assert storage.get(created.id) is None

    def test_delete_nonexistent_todo(self):
        """존재하지 않는 Todo 삭제"""
        storage = TodoStorage()

        result = storage.delete("nonexistent")

        assert result is False

class TestTodosAPI:
    """Todos API 통합 테스트"""

    def test_create_todo(self, client):
        """POST /api/v1/todos - Todo 생성"""
        response = client.post(
            "/api/v1/todos",
            json={"title": "New Todo", "description": "Test description"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Todo"
        assert data["description"] == "Test description"
        assert data["is_completed"] is False
        assert "id" in data
        assert "created_at" in data

    def test_create_todo_minimal(self, client):
        """POST /api/v1/todos - 최소 필드로 생성"""
        response = client.post(
            "/api/v1/todos",
            json={"title": "Minimal Todo"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Todo"
        assert data["description"] is None
        assert data["is_completed"] is False

    def test_list_todos_empty(self, client):
        """GET /api/v1/todos - 빈 목록"""
        response = client.get("/api/v1/todos")

        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_todos(self, client):
        """GET /api/v1/todos - 목록 조회"""
        client.post("/api/v1/todos", json={"title": "Todo 1"})
        client.post("/api/v1/todos", json={"title": "Todo 2"})

        response = client.get("/api/v1/todos")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 2

    def test_list_todos_filter_completed(self, client):
        """GET /api/v1/todos?completed=true - 완료 필터"""
        client.post("/api/v1/todos", json={"title": "Todo 1", "is_completed": False})
        client.post("/api/v1/todos", json={"title": "Todo 2", "is_completed": True})

        # 완료된 것만
        response = client.get("/api/v1/todos?completed=true")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Todo 2"

        # 미완료만
        response = client.get("/api/v1/todos?completed=false")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Todo 1"

    def test_get_todo(self, client):
        """GET /api/v1/todos/{id} - 상세 조회"""
        create_resp = client.post("/api/v1/todos", json={"title": "Test"})
        todo_id = create_resp.json()["id"]

        response = client.get(f"/api/v1/todos/{todo_id}")

        assert response.status_code == 200
        assert response.json()["title"] == "Test"

    def test_get_todo_not_found(self, client):
        """GET /api/v1/todos/{id} - 404"""
        response = client.get("/api/v1/todos/nonexistent-id")

        assert response.status_code == 404

    def test_update_todo(self, client):
        """PATCH /api/v1/todos/{id} - 수정"""
        create_resp = client.post("/api/v1/todos", json={"title": "Original"})
        todo_id = create_resp.json()["id"]

        response = client.patch(
            f"/api/v1/todos/{todo_id}",
            json={"title": "Updated"},
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Updated"

    def test_update_todo_toggle_completion(self, client):
        """PATCH /api/v1/todos/{id} - 완료 상태 토글"""
        create_resp = client.post("/api/v1/todos", json={"title": "Test"})
        todo_id = create_resp.json()["id"]
        assert create_resp.json()["is_completed"] is False

        response = client.patch(
            f"/api/v1/todos/{todo_id}",
            json={"is_completed": True},
        )

        assert response.status_code == 200
        assert response.json()["is_completed"] is True

    def test_update_todo_not_found(self, client):
        """PATCH /api/v1/todos/{id} - 404"""
        response = client.patch(
            "/api/v1/todos/nonexistent",
            json={"title": "Test"},
        )

        assert response.status_code == 404

    def test_delete_todo(self, client):
        """DELETE /api/v1/todos/{id} - 삭제"""
        create_resp = client.post("/api/v1/todos", json={"title": "To Delete"})
        todo_id = create_resp.json()["id"]

        response = client.delete(f"/api/v1/todos/{todo_id}")

        assert response.status_code == 204

        # 삭제 확인
        get_resp = client.get(f"/api/v1/todos/{todo_id}")
        assert get_resp.status_code == 404

    def test_delete_todo_not_found(self, client):
        """DELETE /api/v1/todos/{id} - 404"""
        response = client.delete("/api/v1/todos/nonexistent")

        assert response.status_code == 404

class TestProjectsAPI:
    """Projects API 통합 테스트"""

    def test_create_project(self, client):
        """POST /api/v1/projects - 프로젝트 생성"""
        response = client.post(
            "/api/v1/projects",
            json={"name": "New Project", "description": "Test description"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "Test description"
        assert "id" in data

    def test_create_project_without_description(self, client):
        """POST /api/v1/projects - description 없이 생성"""
        response = client.post("/api/v1/projects", json={"name": "Minimal Project"})

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Project"
        assert data["description"] is None

    def test_list_projects_empty(self, client):
        """GET /api/v1/projects - 빈 목록"""
        response = client.get("/api/v1/projects")

        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_projects(self, client):
        """GET /api/v1/projects - 프로젝트 목록"""
        client.post("/api/v1/projects", json={"name": "Project 1"})
        client.post("/api/v1/projects", json={"name": "Project 2"})

        response = client.get("/api/v1/projects")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 2

    def test_get_project(self, client):
        """GET /api/v1/projects/{id} - 프로젝트 상세"""
        create_response = client.post(
            "/api/v1/projects", json={"name": "Test Project"}
        )
        project_id = create_response.json()["id"]

        response = client.get(f"/api/v1/projects/{project_id}")

        assert response.status_code == 200
        assert response.json()["name"] == "Test Project"

    def test_get_project_not_found(self, client):
        """GET /api/v1/projects/{id} - 404"""
        response = client.get("/api/v1/projects/nonexistent-id")

        assert response.status_code == 404

    def test_update_project(self, client):
        """PUT /api/v1/projects/{id} - 프로젝트 수정"""
        create_response = client.post(
            "/api/v1/projects", json={"name": "Original Name"}
        )
        project_id = create_response.json()["id"]

        response = client.put(
            f"/api/v1/projects/{project_id}",
            json={"name": "Updated Name"},
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    def test_update_project_not_found(self, client):
        """PUT /api/v1/projects/{id} - 404"""
        response = client.put(
            "/api/v1/projects/nonexistent-id",
            json={"name": "Test"},
        )

        assert response.status_code == 404

    def test_delete_project(self, client):
        """DELETE /api/v1/projects/{id} - 프로젝트 삭제"""
        create_response = client.post(
            "/api/v1/projects", json={"name": "To Delete"}
        )
        project_id = create_response.json()["id"]

        response = client.delete(f"/api/v1/projects/{project_id}")

        assert response.status_code == 204

        # 삭제 확인
        get_response = client.get(f"/api/v1/projects/{project_id}")
        assert get_response.status_code == 404

    def test_delete_project_not_found(self, client):
        """DELETE /api/v1/projects/{id} - 404"""
        response = client.delete("/api/v1/projects/nonexistent-id")

        assert response.status_code == 404

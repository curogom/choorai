from app.schemas.project import ProjectCreate, ProjectUpdate
from app.storage.memory import ProjectStorage


class TestProjectStorage:
    """ProjectStorage 단위 테스트"""

    def test_create_project(self):
        """프로젝트 생성"""
        storage = ProjectStorage()
        data = ProjectCreate(name="Test Project", description="Description")

        project = storage.create(data)

        assert project.name == "Test Project"
        assert project.description == "Description"
        assert project.id is not None
        assert project.created_at is not None
        assert project.updated_at is not None

    def test_get_project(self):
        """프로젝트 조회"""
        storage = ProjectStorage()
        data = ProjectCreate(name="Test Project")
        created = storage.create(data)

        project = storage.get(created.id)

        assert project is not None
        assert project.id == created.id
        assert project.name == "Test Project"

    def test_get_nonexistent_project(self):
        """존재하지 않는 프로젝트 조회시 None 반환"""
        storage = ProjectStorage()

        project = storage.get("nonexistent-id")

        assert project is None

    def test_list_projects_pagination(self):
        """프로젝트 목록 페이지네이션"""
        storage = ProjectStorage()
        for i in range(15):
            storage.create(ProjectCreate(name=f"Project {i}"))

        items, total = storage.list(page=1, page_size=10)
        assert len(items) == 10
        assert total == 15

        items, total = storage.list(page=2, page_size=10)
        assert len(items) == 5
        assert total == 15

    def test_update_project(self):
        """프로젝트 수정"""
        storage = ProjectStorage()
        created = storage.create(ProjectCreate(name="Original"))
        original_updated_at = created.updated_at

        updated = storage.update(
            created.id, ProjectUpdate(name="Updated", description="New desc")
        )

        assert updated is not None
        assert updated.name == "Updated"
        assert updated.description == "New desc"
        assert updated.updated_at > original_updated_at

    def test_update_nonexistent_project(self):
        """존재하지 않는 프로젝트 수정시 None 반환"""
        storage = ProjectStorage()

        result = storage.update("nonexistent-id", ProjectUpdate(name="Test"))

        assert result is None

    def test_delete_project(self):
        """프로젝트 삭제"""
        storage = ProjectStorage()
        created = storage.create(ProjectCreate(name="To Delete"))

        result = storage.delete(created.id)

        assert result is True
        assert storage.get(created.id) is None

    def test_delete_nonexistent_project(self):
        """존재하지 않는 프로젝트 삭제시 False 반환"""
        storage = ProjectStorage()

        result = storage.delete("nonexistent-id")

        assert result is False

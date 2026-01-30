from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class ProjectStorage:
    """In-memory 프로젝트 저장소"""

    def __init__(self) -> None:
        self._projects: dict[str, ProjectResponse] = {}

    def create(self, data: ProjectCreate) -> ProjectResponse:
        """프로젝트 생성"""
        now = datetime.now(timezone.utc)
        project = ProjectResponse(
            id=str(uuid4()),
            name=data.name,
            description=data.description,
            created_at=now,
            updated_at=now,
        )
        self._projects[project.id] = project
        return project

    def get(self, project_id: str) -> Optional[ProjectResponse]:
        """프로젝트 조회"""
        return self._projects.get(project_id)

    def list(
        self, page: int = 1, page_size: int = 10
    ) -> tuple[list[ProjectResponse], int]:
        """프로젝트 목록 조회 (페이지네이션)"""
        all_projects = list(self._projects.values())
        all_projects.sort(key=lambda p: p.created_at, reverse=True)

        total = len(all_projects)
        start = (page - 1) * page_size
        end = start + page_size

        return all_projects[start:end], total

    def update(
        self, project_id: str, data: ProjectUpdate
    ) -> Optional[ProjectResponse]:
        """프로젝트 수정"""
        project = self._projects.get(project_id)
        if not project:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return project

        updated = project.model_copy(
            update={
                **update_data,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self._projects[project_id] = updated
        return updated

    def delete(self, project_id: str) -> bool:
        """프로젝트 삭제"""
        if project_id not in self._projects:
            return False
        del self._projects[project_id]
        return True


# 싱글톤 인스턴스
project_storage = ProjectStorage()

from fastapi import APIRouter, HTTPException, Query

from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.storage import project_storage

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])


@router.get("", response_model=ProjectListResponse)
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
) -> ProjectListResponse:
    """프로젝트 목록 조회"""
    items, total = project_storage.list(page=page, page_size=page_size)
    return ProjectListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate) -> ProjectResponse:
    """프로젝트 생성"""
    return project_storage.create(data)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str) -> ProjectResponse:
    """프로젝트 상세 조회"""
    project = project_storage.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate) -> ProjectResponse:
    """프로젝트 수정"""
    project = project_storage.update(project_id, data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str) -> None:
    """프로젝트 삭제"""
    if not project_storage.delete(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

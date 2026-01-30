import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from '../hooks/useProjects';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProject(id || '');
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleEdit = () => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!id || !name.trim()) return;

    updateProject.mutate(
      {
        id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteProject.mutate(id, {
        onSuccess: () => {
          navigate('/');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500 mb-4">프로젝트를 찾을 수 없습니다.</div>
        <Link to="/" className="text-blue-600 hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← 목록으로 돌아가기
        </Link>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로젝트 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={updateProject.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateProject.isPending ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProject.isPending}
                className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded"
              >
                삭제
              </button>
            </div>
          </div>

          {project.description && (
            <p className="text-gray-600 mb-4">{project.description}</p>
          )}

          <div className="text-sm text-gray-400 space-y-1">
            <p>생성: {new Date(project.created_at).toLocaleString('ko-KR')}</p>
            <p>수정: {new Date(project.updated_at).toLocaleString('ko-KR')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

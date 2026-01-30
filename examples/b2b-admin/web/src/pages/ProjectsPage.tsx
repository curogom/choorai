import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '../hooks/useProjects';
import type { Project } from '../types/api';

function ProjectForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          프로젝트 이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="프로젝트 이름 입력"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="프로젝트 설명"
          rows={2}
        />
      </div>
      <button
        type="submit"
        disabled={createProject.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {createProject.isPending ? '생성 중...' : '프로젝트 생성'}
      </button>
    </form>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const deleteProject = useDeleteProject();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteProject.mutate(project.id);
    }
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(project.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteProject.isPending}
          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
        >
          삭제
        </button>
      </div>
    </Link>
  );
}

function ProjectList() {
  const { data, isLoading, isError } = useProjects();

  if (isLoading) {
    return <div className="text-gray-500">프로젝트 로딩 중...</div>;
  }

  if (isError) {
    return <div className="text-red-500">프로젝트를 불러오는데 실패했습니다.</div>;
  }

  if (!data?.items.length) {
    return <div className="text-gray-500">등록된 프로젝트가 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {data.items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <p className="text-sm text-gray-500 text-right">총 {data.total}개</p>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">새 프로젝트</h2>
        <ProjectForm />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">프로젝트 목록</h2>
        <ProjectList />
      </div>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  Project,
  ProjectCreate,
  ProjectListResponse,
  ProjectUpdate,
} from '../types/api';

const PROJECTS_KEY = ['projects'];

export function useProjects(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, page, pageSize],
    queryFn: () =>
      apiClient.get<ProjectListResponse>(
        `/api/v1/projects?page=${page}&page_size=${pageSize}`
      ),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn: () => apiClient.get<Project>(`/api/v1/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) =>
      apiClient.post<Project, ProjectCreate>('/api/v1/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
      apiClient.put<Project, ProjectUpdate>(`/api/v1/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

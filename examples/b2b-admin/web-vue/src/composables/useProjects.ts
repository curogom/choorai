import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { apiClient } from '../api/client';
import type {
  Project,
  ProjectCreate,
  ProjectListResponse,
  ProjectUpdate,
} from '../types/api';

const PROJECTS_KEY = ['projects'];

export function useProjects(page: Ref<number> | number = 1, pageSize: Ref<number> | number = 10) {
  const pageValue = computed(() => (typeof page === 'number' ? page : page.value));
  const pageSizeValue = computed(() => (typeof pageSize === 'number' ? pageSize : pageSize.value));

  return useQuery({
    queryKey: computed(() => [...PROJECTS_KEY, pageValue.value, pageSizeValue.value]),
    queryFn: () =>
      apiClient.get<ProjectListResponse>(
        `/api/v1/projects?page=${pageValue.value}&page_size=${pageSizeValue.value}`
      ),
  });
}

export function useProject(id: Ref<string> | string) {
  const idValue = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery({
    queryKey: computed(() => [...PROJECTS_KEY, idValue.value]),
    queryFn: () => apiClient.get<Project>(`/api/v1/projects/${idValue.value}`),
    enabled: computed(() => !!idValue.value),
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

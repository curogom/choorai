import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { apiClient } from '../api/client';
import type {
  Todo,
  TodoCreate,
  TodoListResponse,
  TodoUpdate,
} from '../types/api';

const TODOS_KEY = ['todos'];

export function useTodos(page: Ref<number> | number = 1, pageSize: Ref<number> | number = 10) {
  const pageValue = computed(() => (typeof page === 'number' ? page : page.value));
  const pageSizeValue = computed(() => (typeof pageSize === 'number' ? pageSize : pageSize.value));

  return useQuery({
    queryKey: computed(() => [...TODOS_KEY, pageValue.value, pageSizeValue.value]),
    queryFn: () =>
      apiClient.get<TodoListResponse>(
        `/api/v1/todos?page=${pageValue.value}&page_size=${pageSizeValue.value}`
      ),
  });
}

export function useTodo(id: Ref<string> | string) {
  const idValue = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery({
    queryKey: computed(() => [...TODOS_KEY, idValue.value]),
    queryFn: () => apiClient.get<Todo>(`/api/v1/todos/${idValue.value}`),
    enabled: computed(() => !!idValue.value),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TodoCreate) =>
      apiClient.post<Todo, TodoCreate>('/api/v1/todos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoUpdate }) =>
      apiClient.patch<Todo, TodoUpdate>(`/api/v1/todos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/todos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

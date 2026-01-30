import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Todo, TodoCreate, TodoListResponse, TodoUpdate } from '../types/api';

const TODOS_KEY = ['todos'];

export function useTodos(page = 1, pageSize = 10, completed?: boolean) {
  return useQuery({
    queryKey: [...TODOS_KEY, page, pageSize, completed],
    queryFn: () => {
      let url = `/api/v1/todos?page=${page}&page_size=${pageSize}`;
      if (completed !== undefined) {
        url += `&completed=${completed}`;
      }
      return apiClient.get<TodoListResponse>(url);
    },
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: [...TODOS_KEY, id],
    queryFn: () => apiClient.get<Todo>(`/api/v1/todos/${id}`),
    enabled: !!id,
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
      apiClient.put<Todo, TodoUpdate>(`/api/v1/todos/${id}`, data),
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

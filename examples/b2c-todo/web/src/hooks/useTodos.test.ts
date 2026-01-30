import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from './useTodos';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTodos', () => {
  it('should fetch todos list', async () => {
    const mockResponse = {
      items: [
        { id: '1', title: 'Todo 1', is_completed: false },
        { id: '2', title: 'Todo 2', is_completed: true },
      ],
      total: 2,
      page: 1,
      page_size: 10,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/todos')
    );
  });

  it('should fetch filtered todos', async () => {
    const mockResponse = {
      items: [{ id: '1', title: 'Todo 1', is_completed: true }],
      total: 1,
      page: 1,
      page_size: 10,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useTodos(1, 10, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('completed=true')
    );
  });
});

describe('useCreateTodo', () => {
  it('should create a todo', async () => {
    const mockTodo = { id: '123', title: 'New Todo', is_completed: false };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTodo),
    });

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ title: 'New Todo' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTodo);
  });
});

describe('useUpdateTodo', () => {
  it('should update a todo', async () => {
    const mockTodo = { id: '123', title: 'Updated', is_completed: true };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTodo),
    });

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: '123', data: { is_completed: true } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTodo);
  });
});

describe('useDeleteTodo', () => {
  it('should delete a todo', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/todos/123'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

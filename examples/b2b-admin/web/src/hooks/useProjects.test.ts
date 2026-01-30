import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useProjects, useCreateProject, useDeleteProject } from './useProjects';

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

describe('useProjects', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('useProjects', () => {
    it('should fetch projects list', async () => {
      const mockResponse = {
        items: [{ id: '1', name: 'Project 1' }],
        total: 1,
        page: 1,
        page_size: 10,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects?page=1&page_size=10'
      );
    });

    it('should handle fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCreateProject', () => {
    it('should create a project', async () => {
      const mockProject = { id: '123', name: 'New Project' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProject),
      });

      const { result } = renderHook(() => useCreateProject(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'New Project' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProject);
    });
  });

  describe('useDeleteProject', () => {
    it('should delete a project', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const { result } = renderHook(() => useDeleteProject(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects/123',
        { method: 'DELETE' }
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, h, defineComponent } from 'vue';
import { useProjects, useCreateProject, useDeleteProject } from '../composables/useProjects';

function withSetup<T>(composable: () => T): { result: T; app: ReturnType<typeof createApp> } {
  let result!: T;

  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return () => h('div');
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const app = createApp(TestComponent);
  app.use(VueQueryPlugin, { queryClient });
  app.mount(document.createElement('div'));

  return { result, app };
}

const originalFetch = global.fetch;

describe('useProjects', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
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

      const { result, app } = withSetup(() => useProjects());

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.data.value).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects?page=1&page_size=10'
      );

      app.unmount();
    });

    it('should handle fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result, app } = withSetup(() => useProjects());

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.isError.value).toBe(true);

      app.unmount();
    });
  });

  describe('useCreateProject', () => {
    it('should create a project', async () => {
      const mockProject = { id: '123', name: 'New Project' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProject),
      });

      const { result, app } = withSetup(() => useCreateProject());

      result.mutate({ name: 'New Project' });

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.data.value).toEqual(mockProject);

      app.unmount();
    });
  });

  describe('useDeleteProject', () => {
    it('should delete a project', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const { result, app } = withSetup(() => useDeleteProject());

      result.mutate('123');

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects/123',
        { method: 'DELETE' }
      );

      app.unmount();
    });
  });
});

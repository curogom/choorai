import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, h, defineComponent } from 'vue';
import { useTodos, useCreateTodo, useDeleteTodo, useUpdateTodo } from '../composables/useTodos';

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

describe('useTodos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('useTodos', () => {
    it('should fetch todos list', async () => {
      const mockResponse = {
        items: [{ id: '1', title: 'Todo 1', is_completed: false }],
        total: 1,
        page: 1,
        page_size: 10,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result, app } = withSetup(() => useTodos());

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.data.value).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/todos?page=1&page_size=10'
      );

      app.unmount();
    });

    it('should handle fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result, app } = withSetup(() => useTodos());

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.isError.value).toBe(true);

      app.unmount();
    });
  });

  describe('useCreateTodo', () => {
    it('should create a todo', async () => {
      const mockTodo = { id: '123', title: 'New Todo', is_completed: false };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTodo),
      });

      const { result, app } = withSetup(() => useCreateTodo());

      result.mutate({ title: 'New Todo' });

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.data.value).toEqual(mockTodo);

      app.unmount();
    });
  });

  describe('useUpdateTodo', () => {
    it('should update a todo', async () => {
      const mockTodo = { id: '123', title: 'Updated Todo', is_completed: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTodo),
      });

      const { result, app } = withSetup(() => useUpdateTodo());

      result.mutate({ id: '123', data: { is_completed: true } });

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/todos/123',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_completed: true }),
        }
      );

      app.unmount();
    });
  });

  describe('useDeleteTodo', () => {
    it('should delete a todo', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const { result, app } = withSetup(() => useDeleteTodo());

      result.mutate('123');

      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/todos/123',
        { method: 'DELETE' }
      );

      app.unmount();
    });
  });
});

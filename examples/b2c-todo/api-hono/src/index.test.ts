import { describe, it, expect, beforeEach } from 'vitest';
import { app, todoStorage } from './index.js';

// Reset storage before each test
beforeEach(() => {
  todoStorage.clear();
});

describe('Health', () => {
  it('returns ok status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.version).toBe('0.1.0');
    expect(data.timestamp).toBeDefined();
  });
});

describe('Todos API', () => {
  describe('POST /api/v1/todos', () => {
    it('creates todo with all fields', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Todo', description: 'A test' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe('Test Todo');
      expect(data.description).toBe('A test');
      expect(data.is_completed).toBe(false);
      expect(data.id).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
    });

    it('creates todo without description', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Minimal Todo' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe('Minimal Todo');
      expect(data.description).toBeNull();
      expect(data.is_completed).toBe(false);
    });

    it('rejects invalid title', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/todos', () => {
    it('returns empty list', async () => {
      const res = await app.request('/api/v1/todos');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.page).toBe(1);
      expect(data.page_size).toBe(10);
    });

    it('returns todos with pagination', async () => {
      // Create 3 todos
      for (let i = 1; i <= 3; i++) {
        await app.request('/api/v1/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `Todo ${i}` }),
        });
      }

      const res = await app.request('/api/v1/todos?page=1&page_size=2');
      const data = await res.json();

      expect(data.items.length).toBe(2);
      expect(data.total).toBe(3);
      expect(data.page).toBe(1);
      expect(data.page_size).toBe(2);
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    it('returns todo by id', async () => {
      // Create todo
      const createRes = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Find Me' }),
      });
      const created = await createRes.json();

      // Get todo
      const res = await app.request(`/api/v1/todos/${created.id}`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.title).toBe('Find Me');
    });

    it('returns 404 for non-existent todo', async () => {
      const res = await app.request('/api/v1/todos/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/todos/:id', () => {
    it('updates todo title', async () => {
      // Create todo
      const createRes = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Original' }),
      });
      const created = await createRes.json();

      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10));

      // Update todo
      const res = await app.request(`/api/v1/todos/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('Updated');
      expect(data.updated_at).not.toBe(created.updated_at);
    });

    it('marks todo as completed', async () => {
      // Create todo
      const createRes = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Complete Me' }),
      });
      const created = await createRes.json();
      expect(created.is_completed).toBe(false);

      // Mark as completed
      const res = await app.request(`/api/v1/todos/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.is_completed).toBe(true);
    });

    it('returns 404 for non-existent todo', async () => {
      const res = await app.request('/api/v1/todos/non-existent-id', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    it('deletes todo', async () => {
      // Create todo
      const createRes = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Delete Me' }),
      });
      const created = await createRes.json();

      // Delete todo
      const res = await app.request(`/api/v1/todos/${created.id}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(204);

      // Verify deleted
      const getRes = await app.request(`/api/v1/todos/${created.id}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent todo', async () => {
      const res = await app.request('/api/v1/todos/non-existent-id', {
        method: 'DELETE',
      });
      expect(res.status).toBe(404);
    });
  });
});

describe('Storage', () => {
  it('creates todo with UUID', () => {
    const todo = todoStorage.create({ title: 'Test' });
    expect(todo.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('creates todo with is_completed false by default', () => {
    const todo = todoStorage.create({ title: 'Test' });
    expect(todo.is_completed).toBe(false);
  });

  it('lists todos sorted by created_at descending', async () => {
    todoStorage.create({ title: 'First' });
    await new Promise((r) => setTimeout(r, 10)); // Small delay
    todoStorage.create({ title: 'Second' });

    const { items } = todoStorage.list(1, 10);
    expect(items[0].title).toBe('Second');
    expect(items[1].title).toBe('First');
  });

  it('handles pagination correctly', () => {
    for (let i = 0; i < 25; i++) {
      todoStorage.create({ title: `Todo ${i}` });
    }

    const page1 = todoStorage.list(1, 10);
    const page2 = todoStorage.list(2, 10);
    const page3 = todoStorage.list(3, 10);

    expect(page1.items.length).toBe(10);
    expect(page2.items.length).toBe(10);
    expect(page3.items.length).toBe(5);
    expect(page1.total).toBe(25);
  });

  it('updates only provided fields', () => {
    const todo = todoStorage.create({ title: 'Original', description: 'Desc' });
    const updated = todoStorage.update(todo.id, { title: 'New Title' });

    expect(updated?.title).toBe('New Title');
    expect(updated?.description).toBe('Desc');
    expect(updated?.is_completed).toBe(false);
  });

  it('updates is_completed field', () => {
    const todo = todoStorage.create({ title: 'Test' });
    expect(todo.is_completed).toBe(false);

    const updated = todoStorage.update(todo.id, { is_completed: true });
    expect(updated?.is_completed).toBe(true);
  });
});

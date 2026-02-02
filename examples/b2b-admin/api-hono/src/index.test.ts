import { describe, it, expect, beforeEach } from 'vitest';
import { app, projectStorage } from './index.js';

// Reset storage before each test
beforeEach(() => {
  projectStorage.clear();
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

describe('Projects API', () => {
  describe('POST /api/v1/projects', () => {
    it('creates project with all fields', async () => {
      const res = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Project', description: 'A test' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.name).toBe('Test Project');
      expect(data.description).toBe('A test');
      expect(data.id).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
    });

    it('creates project without description', async () => {
      const res = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Minimal Project' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.name).toBe('Minimal Project');
      expect(data.description).toBeNull();
    });

    it('rejects invalid name', async () => {
      const res = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('returns empty list', async () => {
      const res = await app.request('/api/v1/projects');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.page).toBe(1);
      expect(data.page_size).toBe(10);
    });

    it('returns projects with pagination', async () => {
      // Create 3 projects
      for (let i = 1; i <= 3; i++) {
        await app.request('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Project ${i}` }),
        });
      }

      const res = await app.request('/api/v1/projects?page=1&page_size=2');
      const data = await res.json();

      expect(data.items.length).toBe(2);
      expect(data.total).toBe(3);
      expect(data.page).toBe(1);
      expect(data.page_size).toBe(2);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('returns project by id', async () => {
      // Create project
      const createRes = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Find Me' }),
      });
      const created = await createRes.json();

      // Get project
      const res = await app.request(`/api/v1/projects/${created.id}`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.name).toBe('Find Me');
    });

    it('returns 404 for non-existent project', async () => {
      const res = await app.request('/api/v1/projects/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('updates project', async () => {
      // Create project
      const createRes = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Original' }),
      });
      const created = await createRes.json();

      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10));

      // Update project
      const res = await app.request(`/api/v1/projects/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('Updated');
      expect(data.updated_at).not.toBe(created.updated_at);
    });

    it('returns 404 for non-existent project', async () => {
      const res = await app.request('/api/v1/projects/non-existent-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('deletes project', async () => {
      // Create project
      const createRes = await app.request('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Delete Me' }),
      });
      const created = await createRes.json();

      // Delete project
      const res = await app.request(`/api/v1/projects/${created.id}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(204);

      // Verify deleted
      const getRes = await app.request(`/api/v1/projects/${created.id}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent project', async () => {
      const res = await app.request('/api/v1/projects/non-existent-id', {
        method: 'DELETE',
      });
      expect(res.status).toBe(404);
    });
  });
});

describe('Storage', () => {
  it('creates project with UUID', () => {
    const project = projectStorage.create({ name: 'Test' });
    expect(project.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('lists projects sorted by created_at descending', async () => {
    projectStorage.create({ name: 'First' });
    await new Promise((r) => setTimeout(r, 10)); // Small delay
    projectStorage.create({ name: 'Second' });

    const { items } = projectStorage.list(1, 10);
    expect(items[0].name).toBe('Second');
    expect(items[1].name).toBe('First');
  });

  it('handles pagination correctly', () => {
    for (let i = 0; i < 25; i++) {
      projectStorage.create({ name: `Project ${i}` });
    }

    const page1 = projectStorage.list(1, 10);
    const page2 = projectStorage.list(2, 10);
    const page3 = projectStorage.list(3, 10);

    expect(page1.items.length).toBe(10);
    expect(page2.items.length).toBe(10);
    expect(page3.items.length).toBe(5);
    expect(page1.total).toBe(25);
  });

  it('updates only provided fields', () => {
    const project = projectStorage.create({ name: 'Original', description: 'Desc' });
    const updated = projectStorage.update(project.id, { name: 'New Name' });

    expect(updated?.name).toBe('New Name');
    expect(updated?.description).toBe('Desc');
  });
});

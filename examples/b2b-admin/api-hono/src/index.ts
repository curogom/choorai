import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { projectStorage } from './storage/index.js';
import {
  validateProjectCreate,
  validateProjectUpdate,
  type HealthResponse,
  type ProjectListResponse,
} from './types/index.js';

const app = new Hono();

// Configuration
const config = {
  appName: 'B2B Admin API',
  version: '0.1.0',
  allowedOrigins: ['http://localhost:5173'],
};

// CORS Middleware
app.use('*', cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

// ============ Health ============
app.get('/health', (c) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.version,
  };
  return c.json(response);
});

// ============ Projects ============

// List projects
app.get('/api/v1/projects', (c) => {
  const pageParam = c.req.query('page');
  const pageSizeParam = c.req.query('page_size');

  let page = pageParam ? parseInt(pageParam, 10) : 1;
  let pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

  // Validation
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || pageSize < 1) pageSize = 1;
  if (pageSize > 100) pageSize = 100;

  const { items, total } = projectStorage.list(page, pageSize);

  const response: ProjectListResponse = {
    items,
    total,
    page,
    page_size: pageSize,
  };

  return c.json(response);
});

// Create project
app.post('/api/v1/projects', async (c) => {
  const body = await c.req.json().catch(() => null);
  const validation = validateProjectCreate(body);

  if (!validation.valid) {
    return c.json({ detail: validation.error }, 422);
  }

  const project = projectStorage.create(validation.data);
  return c.json(project, 201);
});

// Get project
app.get('/api/v1/projects/:id', (c) => {
  const id = c.req.param('id');
  const project = projectStorage.get(id);

  if (!project) {
    return c.json({ detail: 'Project not found' }, 404);
  }

  return c.json(project);
});

// Update project
app.put('/api/v1/projects/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  const validation = validateProjectUpdate(body);

  if (!validation.valid) {
    return c.json({ detail: validation.error }, 422);
  }

  const project = projectStorage.update(id, validation.data);

  if (!project) {
    return c.json({ detail: 'Project not found' }, 404);
  }

  return c.json(project);
});

// Delete project
app.delete('/api/v1/projects/:id', (c) => {
  const id = c.req.param('id');
  const deleted = projectStorage.delete(id);

  if (!deleted) {
    return c.json({ detail: 'Project not found' }, 404);
  }

  return c.body(null, 204);
});

// Export for testing
export { app, projectStorage };

// Start server (only when run directly)
const port = parseInt(process.env.PORT || '8000', 10);

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 B2B Admin API (Hono) running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

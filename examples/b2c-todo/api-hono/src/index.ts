import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { todoStorage } from './storage/index.js';
import {
  validateTodoCreate,
  validateTodoUpdate,
  type HealthResponse,
  type TodoListResponse,
} from './types/index.js';

const app = new Hono();

// Configuration
const config = {
  appName: 'B2C Todo API',
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

// ============ Todos ============

// List todos
app.get('/api/v1/todos', (c) => {
  const pageParam = c.req.query('page');
  const pageSizeParam = c.req.query('page_size');

  let page = pageParam ? parseInt(pageParam, 10) : 1;
  let pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

  // Validation
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || pageSize < 1) pageSize = 1;
  if (pageSize > 100) pageSize = 100;

  const { items, total } = todoStorage.list(page, pageSize);

  const response: TodoListResponse = {
    items,
    total,
    page,
    page_size: pageSize,
  };

  return c.json(response);
});

// Create todo
app.post('/api/v1/todos', async (c) => {
  const body = await c.req.json().catch(() => null);
  const validation = validateTodoCreate(body);

  if (!validation.valid) {
    return c.json({ detail: validation.error }, 422);
  }

  const todo = todoStorage.create(validation.data);
  return c.json(todo, 201);
});

// Get todo
app.get('/api/v1/todos/:id', (c) => {
  const id = c.req.param('id');
  const todo = todoStorage.get(id);

  if (!todo) {
    return c.json({ detail: 'Todo not found' }, 404);
  }

  return c.json(todo);
});

// Update todo (PATCH for partial update)
app.patch('/api/v1/todos/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  const validation = validateTodoUpdate(body);

  if (!validation.valid) {
    return c.json({ detail: validation.error }, 422);
  }

  const todo = todoStorage.update(id, validation.data);

  if (!todo) {
    return c.json({ detail: 'Todo not found' }, 404);
  }

  return c.json(todo);
});

// Delete todo
app.delete('/api/v1/todos/:id', (c) => {
  const id = c.req.param('id');
  const deleted = todoStorage.delete(id);

  if (!deleted) {
    return c.json({ detail: 'Todo not found' }, 404);
  }

  return c.body(null, 204);
});

// Export for testing
export { app, todoStorage };

// Start server (only when run directly)
const port = parseInt(process.env.PORT || '8000', 10);

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 B2C Todo API (Hono) running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

// Health Response
export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
}

// Todo Types
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string | null;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface TodoListResponse {
  items: Todo[];
  total: number;
  page: number;
  page_size: number;
}

// Validation
export function validateTodoCreate(data: unknown): { valid: true; data: TodoCreate } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.title !== 'string' || obj.title.length < 1 || obj.title.length > 200) {
    return { valid: false, error: 'title must be 1-200 characters' };
  }

  if (obj.description !== undefined && obj.description !== null) {
    if (typeof obj.description !== 'string' || obj.description.length > 1000) {
      return { valid: false, error: 'description must be 0-1000 characters' };
    }
  }

  return {
    valid: true,
    data: {
      title: obj.title,
      description: obj.description as string | undefined,
    },
  };
}

export function validateTodoUpdate(data: unknown): { valid: true; data: TodoUpdate } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const obj = data as Record<string, unknown>;
  const update: TodoUpdate = {};

  if (obj.title !== undefined) {
    if (typeof obj.title !== 'string' || obj.title.length < 1 || obj.title.length > 200) {
      return { valid: false, error: 'title must be 1-200 characters' };
    }
    update.title = obj.title;
  }

  if (obj.description !== undefined) {
    if (obj.description !== null && (typeof obj.description !== 'string' || obj.description.length > 1000)) {
      return { valid: false, error: 'description must be 0-1000 characters' };
    }
    update.description = obj.description as string | null;
  }

  if (obj.is_completed !== undefined) {
    if (typeof obj.is_completed !== 'boolean') {
      return { valid: false, error: 'is_completed must be a boolean' };
    }
    update.is_completed = obj.is_completed;
  }

  return { valid: true, data: update };
}

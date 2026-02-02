// Health Response
export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
}

// Validation
export function validateProjectCreate(data: unknown): { valid: true; data: ProjectCreate } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.length < 1 || obj.name.length > 100) {
    return { valid: false, error: 'name must be 1-100 characters' };
  }

  if (obj.description !== undefined && obj.description !== null) {
    if (typeof obj.description !== 'string' || obj.description.length > 500) {
      return { valid: false, error: 'description must be 0-500 characters' };
    }
  }

  return {
    valid: true,
    data: {
      name: obj.name,
      description: obj.description as string | undefined,
    },
  };
}

export function validateProjectUpdate(data: unknown): { valid: true; data: ProjectUpdate } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const obj = data as Record<string, unknown>;
  const update: ProjectUpdate = {};

  if (obj.name !== undefined) {
    if (typeof obj.name !== 'string' || obj.name.length < 1 || obj.name.length > 100) {
      return { valid: false, error: 'name must be 1-100 characters' };
    }
    update.name = obj.name;
  }

  if (obj.description !== undefined) {
    if (obj.description !== null && (typeof obj.description !== 'string' || obj.description.length > 500)) {
      return { valid: false, error: 'description must be 0-500 characters' };
    }
    update.description = obj.description as string | null;
  }

  return { valid: true, data: update };
}

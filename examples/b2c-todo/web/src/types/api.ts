// OpenAPI 스펙 기반 타입 정의

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// Todos
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoListResponse {
  items: Todo[];
  total: number;
  page: number;
  page_size: number;
}

export interface TodoCreate {
  title: string;
  description?: string;
  is_completed?: boolean;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

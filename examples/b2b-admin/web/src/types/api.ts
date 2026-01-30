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

import { useQuery } from '@tanstack/vue-query';
import { apiClient } from '../api/client';
import type { HealthResponse } from '../types/api';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthResponse>('/health'),
    refetchInterval: 30000, // 30초마다 체크
  });
}

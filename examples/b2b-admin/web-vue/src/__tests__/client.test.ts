import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api/client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should fetch and return JSON data', async () => {
      const mockData = { status: 'ok', version: '1.0.0' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get('/health');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/health');
      expect(result).toEqual(mockData);
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(apiClient.get('/not-found')).rejects.toThrow('API Error: 404');
    });
  });

  describe('post', () => {
    it('should send POST request with JSON body', async () => {
      const mockResponse = { id: '123', name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post('/api/v1/projects', { name: 'Test' });

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(apiClient.post('/api/v1/projects', {})).rejects.toThrow(
        'API Error: 400'
      );
    });
  });

  describe('put', () => {
    it('should send PUT request with JSON body', async () => {
      const mockResponse = { id: '123', name: 'Updated' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.put('/api/v1/projects/123', {
        name: 'Updated',
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects/123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Updated' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should send DELETE request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      await apiClient.delete('/api/v1/projects/123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/projects/123',
        {
          method: 'DELETE',
        }
      );
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(apiClient.delete('/api/v1/projects/123')).rejects.toThrow(
        'API Error: 404'
      );
    });
  });
});

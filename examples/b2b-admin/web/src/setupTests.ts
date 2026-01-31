import '@testing-library/dom';

// Global fetch mock helper
export function mockFetch(response: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
}

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

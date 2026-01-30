import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHealth } from './hooks/useHealth';

const queryClient = new QueryClient();

function HealthStatus() {
  const { data, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-gray-500">연결 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="text-red-500">서버 연결 실패</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full" />
      <span className="text-green-600">
        서버 정상 (v{data?.version})
      </span>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            B2B Admin
          </h1>
          <HealthStatus />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            환영합니다!
          </h2>
          <p className="text-gray-600">
            B2B Admin Console 예시 프로젝트입니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

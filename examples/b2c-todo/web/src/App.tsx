import { Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHealth } from './hooks/useHealth';
import TodosPage from './pages/TodosPage';

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
      <span className="text-green-600">서버 정상 (v{data?.version})</span>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Todo App
          </Link>
          <HealthStatus />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TodosPage />} />
      </Routes>
    </Layout>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

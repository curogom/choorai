import { useState } from 'react';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import type { Todo } from '../types/api';

type FilterType = 'all' | 'active' | 'completed';

function TodoForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createTodo = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTodo.mutate(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          할 일
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="할 일을 입력하세요"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="상세 내용"
          rows={2}
        />
      </div>
      <button
        type="submit"
        disabled={createTodo.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {createTodo.isPending ? '추가 중...' : '할 일 추가'}
      </button>
    </form>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    updateTodo.mutate({
      id: todo.id,
      data: { is_completed: !todo.is_completed },
    });
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteTodo.mutate(todo.id);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={handleToggle}
        disabled={updateTodo.isPending}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">{todo.description}</p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleteTodo.isPending}
        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded"
      >
        삭제
      </button>
    </div>
  );
}

function FilterTabs({
  filter,
  onChange,
}: {
  filter: FilterType;
  onChange: (f: FilterType) => void;
}) {
  const tabs: { value: FilterType; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'active', label: '진행 중' },
    { value: 'completed', label: '완료' },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === tab.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function TodoList({ filter }: { filter: FilterType }) {
  const completed = filter === 'all' ? undefined : filter === 'completed';
  const { data, isLoading, isError } = useTodos(1, 100, completed);

  if (isLoading) {
    return <div className="text-gray-500 py-8 text-center">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500 py-8 text-center">
        데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="text-gray-400 py-8 text-center">
        {filter === 'all' && '할 일을 추가해보세요!'}
        {filter === 'active' && '진행 중인 할 일이 없습니다.'}
        {filter === 'completed' && '완료된 할 일이 없습니다.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.items.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      <p className="text-sm text-gray-500 text-right pt-2">총 {data.total}개</p>
    </div>
  );
}

export default function TodosPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">새 할 일</h2>
        <TodoForm />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">할 일 목록</h2>
        </div>
        <FilterTabs filter={filter} onChange={setFilter} />
        <div className="mt-4">
          <TodoList filter={filter} />
        </div>
      </div>
    </div>
  );
}

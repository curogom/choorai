import { v4 as uuidv4 } from 'uuid';
import type { Todo, TodoCreate, TodoUpdate } from '../types/index.js';

class TodoStorage {
  private todos: Map<string, Todo> = new Map();

  create(data: TodoCreate): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      description: data.description ?? null,
      is_completed: false,
      created_at: now,
      updated_at: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  get(id: string): Todo | null {
    return this.todos.get(id) ?? null;
  }

  list(page: number, pageSize: number): { items: Todo[]; total: number } {
    const all = Array.from(this.todos.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total: all.length };
  }

  update(id: string, data: TodoUpdate): Todo | null {
    const todo = this.todos.get(id);
    if (!todo) return null;

    const updated: Todo = {
      ...todo,
      title: data.title ?? todo.title,
      description: data.description !== undefined ? data.description : todo.description,
      is_completed: data.is_completed !== undefined ? data.is_completed : todo.is_completed,
      updated_at: new Date().toISOString(),
    };
    this.todos.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.todos.delete(id);
  }

  clear(): void {
    this.todos.clear();
  }
}

export const todoStorage = new TodoStorage();

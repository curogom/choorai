import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  private todos: Map<string, Todo> = new Map();

  create(createTodoDto: CreateTodoDto): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: uuidv4(),
      title: createTodoDto.title,
      description: createTodoDto.description ?? null,
      is_completed: false,
      created_at: now,
      updated_at: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  findAll(
    page: number,
    pageSize: number,
  ): { items: Todo[]; total: number; page: number; page_size: number } {
    const all = Array.from(this.todos.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total: all.length, page, page_size: pageSize };
  }

  findOne(id: string): Todo {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  update(id: string, updateTodoDto: UpdateTodoDto): Todo {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    const updated: Todo = {
      ...todo,
      title: updateTodoDto.title ?? todo.title,
      description:
        updateTodoDto.description !== undefined
          ? updateTodoDto.description
          : todo.description,
      is_completed:
        updateTodoDto.is_completed !== undefined
          ? updateTodoDto.is_completed
          : todo.is_completed,
      updated_at: new Date().toISOString(),
    };
    this.todos.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    const exists = this.todos.has(id);
    if (!exists) {
      throw new NotFoundException('Todo not found');
    }
    this.todos.delete(id);
  }

  // For testing
  clear(): void {
    this.todos.clear();
  }
}

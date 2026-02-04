<script setup lang="ts">
import type { Todo } from '../types/api';
import { useUpdateTodo, useDeleteTodo } from '../composables/useTodos';

const props = defineProps<{
  todo: Todo;
}>();

const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

const toggleComplete = () => {
  updateTodo({ id: props.todo.id, data: { is_completed: !props.todo.is_completed } });
};

const handleDelete = () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteTodo(props.todo.id);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};
</script>

<template>
  <div
    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
    :class="{ 'bg-gray-50': todo.is_completed }"
  >
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        :checked="todo.is_completed"
        @change="toggleComplete"
        :disabled="isUpdating"
        class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div class="flex-1">
        <h3
          class="font-semibold"
          :class="todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'"
        >
          {{ todo.title }}
        </h3>
        <p v-if="todo.description" class="text-sm text-gray-600 mt-1">
          {{ todo.description }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          {{ formatDate(todo.created_at) }}
        </p>
      </div>
      <button
        @click="handleDelete"
        :disabled="isDeleting"
        class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
      >
        삭제
      </button>
    </div>
  </div>
</template>

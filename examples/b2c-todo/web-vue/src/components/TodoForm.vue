<script setup lang="ts">
import { ref } from 'vue';
import { useCreateTodo } from '../composables/useTodos';

const title = ref('');
const description = ref('');
const { mutate: createTodo, isPending } = useCreateTodo();

const handleSubmit = () => {
  if (!title.value.trim()) return;

  createTodo(
    { title: title.value.trim(), description: description.value.trim() || undefined },
    {
      onSuccess: () => {
        title.value = '';
        description.value = '';
      },
    }
  );
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        할 일
      </label>
      <input
        v-model="title"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="할 일을 입력하세요"
        required
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        설명 (선택)
      </label>
      <textarea
        v-model="description"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="상세 설명"
        rows="2"
      />
    </div>
    <button
      type="submit"
      :disabled="isPending"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {{ isPending ? '추가 중...' : '할 일 추가' }}
    </button>
  </form>
</template>

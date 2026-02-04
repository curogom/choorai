<script setup lang="ts">
import { useTodos } from '../composables/useTodos';
import TodoForm from '../components/TodoForm.vue';
import TodoItem from '../components/TodoItem.vue';

const { data, isLoading, isError } = useTodos();
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">새 할 일</h2>
      <TodoForm />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">할 일 목록</h2>

      <div v-if="isLoading" class="text-gray-500">
        할 일 로딩 중...
      </div>

      <div v-else-if="isError" class="text-red-500">
        할 일을 불러오는데 실패했습니다.
      </div>

      <div v-else-if="!data?.items.length" class="text-gray-500">
        등록된 할 일이 없습니다.
      </div>

      <div v-else class="space-y-3">
        <TodoItem
          v-for="todo in data.items"
          :key="todo.id"
          :todo="todo"
        />
        <p class="text-sm text-gray-500 text-right">총 {{ data.total }}개</p>
      </div>
    </div>
  </div>
</template>

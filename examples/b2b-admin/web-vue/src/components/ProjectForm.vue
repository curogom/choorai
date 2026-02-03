<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProject } from '../composables/useProjects';

const name = ref('');
const description = ref('');
const { mutate: createProject, isPending } = useCreateProject();

const handleSubmit = () => {
  if (!name.value.trim()) return;

  createProject(
    { name: name.value.trim(), description: description.value.trim() || undefined },
    {
      onSuccess: () => {
        name.value = '';
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
        프로젝트 이름
      </label>
      <input
        v-model="name"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="프로젝트 이름 입력"
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
        placeholder="프로젝트 설명"
        rows="2"
      />
    </div>
    <button
      type="submit"
      :disabled="isPending"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {{ isPending ? '생성 중...' : '프로젝트 생성' }}
    </button>
  </form>
</template>

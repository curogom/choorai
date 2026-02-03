<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Project } from '../types/api';
import { useDeleteProject } from '../composables/useProjects';

const props = defineProps<{
  project: Project;
}>();

const { mutate: deleteProject, isPending } = useDeleteProject();

const handleDelete = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteProject(props.project.id);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};
</script>

<template>
  <RouterLink
    :to="`/projects/${project.id}`"
    class="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
  >
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-semibold text-gray-900">{{ project.name }}</h3>
        <p v-if="project.description" class="text-sm text-gray-600 mt-1">
          {{ project.description }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          {{ formatDate(project.created_at) }}
        </p>
      </div>
      <button
        @click="handleDelete"
        :disabled="isPending"
        class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
      >
        삭제
      </button>
    </div>
  </RouterLink>
</template>

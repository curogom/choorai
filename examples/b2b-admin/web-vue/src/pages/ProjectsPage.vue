<script setup lang="ts">
import { useProjects } from '../composables/useProjects';
import ProjectForm from '../components/ProjectForm.vue';
import ProjectCard from '../components/ProjectCard.vue';

const { data, isLoading, isError } = useProjects();
</script>

<template>
  <div class="grid md:grid-cols-2 gap-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">새 프로젝트</h2>
      <ProjectForm />
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">프로젝트 목록</h2>

      <div v-if="isLoading" class="text-gray-500">
        프로젝트 로딩 중...
      </div>

      <div v-else-if="isError" class="text-red-500">
        프로젝트를 불러오는데 실패했습니다.
      </div>

      <div v-else-if="!data?.items.length" class="text-gray-500">
        등록된 프로젝트가 없습니다.
      </div>

      <div v-else class="space-y-3">
        <ProjectCard
          v-for="project in data.items"
          :key="project.id"
          :project="project"
        />
        <p class="text-sm text-gray-500 text-right">총 {{ data.total }}개</p>
      </div>
    </div>
  </div>
</template>

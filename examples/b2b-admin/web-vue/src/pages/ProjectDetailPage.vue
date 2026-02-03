<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useProject, useUpdateProject, useDeleteProject } from '../composables/useProjects';

const route = useRoute();
const router = useRouter();

const id = ref(route.params.id as string);

// 라우트 변경 시 id 업데이트
watch(() => route.params.id, (newId) => {
  id.value = newId as string;
});

const { data: project, isLoading, isError } = useProject(id);
const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

const isEditing = ref(false);
const name = ref('');
const description = ref('');

const handleEdit = () => {
  if (project.value) {
    name.value = project.value.name;
    description.value = project.value.description || '';
    isEditing.value = true;
  }
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleSave = () => {
  if (!id.value || !name.value.trim()) return;

  updateProject(
    {
      id: id.value,
      data: {
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        isEditing.value = false;
      },
    }
  );
};

const handleDelete = () => {
  if (!id.value) return;
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteProject(id.value, {
      onSuccess: () => {
        router.push('/');
      },
    });
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ko-KR');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-gray-500">
      로딩 중...
    </div>

    <!-- 에러 또는 프로젝트 없음 -->
    <div v-else-if="isError || !project">
      <div class="text-red-500 mb-4">프로젝트를 찾을 수 없습니다.</div>
      <RouterLink to="/" class="text-blue-600 hover:underline">
        ← 목록으로 돌아가기
      </RouterLink>
    </div>

    <!-- 프로젝트 상세 -->
    <template v-else>
      <div class="mb-4">
        <RouterLink to="/" class="text-blue-600 hover:underline text-sm">
          ← 목록으로 돌아가기
        </RouterLink>
      </div>

      <!-- 수정 모드 -->
      <div v-if="isEditing" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            프로젝트 이름
          </label>
          <input
            v-model="name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            v-model="description"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="handleSave"
            :disabled="isUpdating"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isUpdating ? '저장 중...' : '저장' }}
          </button>
          <button
            @click="handleCancel"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
        </div>
      </div>

      <!-- 보기 모드 -->
      <div v-else>
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
          <div class="flex gap-2">
            <button
              @click="handleEdit"
              class="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded"
            >
              수정
            </button>
            <button
              @click="handleDelete"
              :disabled="isDeleting"
              class="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded"
            >
              삭제
            </button>
          </div>
        </div>

        <p v-if="project.description" class="text-gray-600 mb-4">
          {{ project.description }}
        </p>

        <div class="text-sm text-gray-400 space-y-1">
          <p>생성: {{ formatDateTime(project.created_at) }}</p>
          <p>수정: {{ formatDateTime(project.updated_at) }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

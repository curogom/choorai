<script setup lang="ts">
import { useHealth } from '../composables/useHealth';

const { data, isLoading, isError } = useHealth();
</script>

<template>
  <div v-if="isLoading" class="flex items-center gap-2">
    <div class="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
    <span class="text-gray-500">연결 중...</span>
  </div>

  <div v-else-if="isError" class="flex items-center gap-2">
    <div class="w-3 h-3 bg-red-500 rounded-full" />
    <span class="text-red-500">서버 연결 실패</span>
  </div>

  <div v-else class="flex items-center gap-2">
    <div class="w-3 h-3 bg-green-500 rounded-full" />
    <span class="text-green-600">서버 정상 (v{{ data?.version }})</span>
  </div>
</template>

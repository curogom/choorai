<script setup lang="ts">
import HealthStatus from './HealthStatus.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900">
          Todo App
        </h1>
        <HealthStatus />
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

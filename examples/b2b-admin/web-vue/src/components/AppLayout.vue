<script setup lang="ts">
import { RouterLink } from 'vue-router';
import HealthStatus from './HealthStatus.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <RouterLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600">
          B2B Admin
        </RouterLink>
        <HealthStatus />
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

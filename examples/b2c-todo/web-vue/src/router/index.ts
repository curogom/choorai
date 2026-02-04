import { createRouter, createWebHistory } from 'vue-router';
import TodosPage from '../pages/TodosPage.vue';

const routes = [
  { path: '/', component: TodosPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

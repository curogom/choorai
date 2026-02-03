import { createRouter, createWebHistory } from 'vue-router';
import ProjectsPage from '../pages/ProjectsPage.vue';
import ProjectDetailPage from '../pages/ProjectDetailPage.vue';

const routes = [
  { path: '/', component: ProjectsPage },
  { path: '/projects/:id', component: ProjectDetailPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

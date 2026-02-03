import { createApp } from 'vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

const app = createApp(App);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount('#app');

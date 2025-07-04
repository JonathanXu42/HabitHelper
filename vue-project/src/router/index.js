// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Landing from '../views/Landing.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import ProgressLog from '@/views/ProgressLog.vue';
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/landing', name: 'Landing', component: Landing },
  { path: '/reset-password', name: 'Reset-Password', component: ResetPassword},
  { path: '/progress-log', name: 'Progress-Log', component: ProgressLog },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
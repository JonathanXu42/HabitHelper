// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Landing from '../views/Landing.vue';

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/landing', name: 'Landing', component: Landing },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
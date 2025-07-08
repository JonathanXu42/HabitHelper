// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { checkAuth } from '../auth';
import Login from '../views/Login.vue';
import Landing from '../views/Landing.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ProgressLog from '../views/ProgressLog.vue';
import Settings from '../views/Settings.vue';
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/landing', name: 'Landing', component: Landing, meta: { requiresAuth: true } },
  { path: '/reset-password', name: 'Reset-Password', component: ResetPassword},
  { path: '/progress-log', name: 'Progress-Log', component: ProgressLog },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = await checkAuth();
    if (!user) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
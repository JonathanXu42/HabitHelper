// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore' //
import Login from '../views/Login.vue';
import CreateAccount from '../views/CreateAccount.vue';
import Landing from '../views/Landing.vue';
import HabitLog from '../views/HabitLog.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ProgressLog from '../views/ProgressLog.vue';
import Settings from '../views/Settings.vue';
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/create-account', name: 'Create-Account', component: CreateAccount },
  { path: '/landing', name: 'Landing', component: Landing, meta: { requiresAuth: true } },
  { path: '/habit/:habitId/logs', name: 'HabitLog', component: HabitLog, meta: { requiresAuth: true} },
  { path: '/reset-password', name: 'Reset-Password', component: ResetPassword },
  { path: '/progress-log', name: 'Progress-Log', component: ProgressLog },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.user === null && to.meta.requiresAuth) {
    await userStore.fetchUser()
  }

  if (to.meta.requiresAuth && !userStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router;
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import router from './router'
import { useUserStore } from './stores/userStore';

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersistedState)

app.use(createPinia())
app.use(router)

// Call fetchUser once globally before app mounts
const userStore = useUserStore();
userStore.fetchUser().finally(() => {
  app.mount('#app');
});
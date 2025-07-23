import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import router from './router'
import { useUserStore } from './stores/userStore';
import { useCsrfStore } from './stores/csrfStore';
import Toast from './components/Toast.vue';

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(pinia)

Toast.install(app);
app.use(router)

// Call fetchUser once globally before app mounts
const userStore = useUserStore();
const csrfStore = useCsrfStore();

userStore.fetchUser().catch(console.error).finally(() => {
  csrfStore.fetchCsrfToken().catch(console.error).finally(() => {
    app.mount('#app');
  });
});
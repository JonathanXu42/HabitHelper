<template>
  <Header v-if="userStore.isLoggedIn" />

  <div class="not-found">
    <div class="icon">👻</div>
    <h1>404</h1>
    <p class="subtitle">Page Not Found</p>
    <p class="message">The page you're looking for doesn't exist or has been moved.</p>
    <button @click="$router.push('/landing')">🏠 Back to Home</button>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import { useUserStore } from '../stores/userStore';

export default {
  name: 'NotFound',
  components: {
    Header
  },
  data() {
    return {
      userStore: null
    };
  },
  created() {
    this.userStore = useUserStore();
  }
};
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 80vh;
  background-color: #121212;
  color: #f0f0f0;
  text-align: center;
  animation: fadeIn 0.4s ease;
}

.icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

h1 {
  font-size: 4rem;
  margin: 0;
  color: #4caf50;
  text-shadow: 0 0 8px rgba(76, 175, 80, 0.8);
}

.subtitle {
  font-size: 1.5rem;
  margin-top: 0.5rem;
  color: #ccc;
}

.message {
  max-width: 500px;
  font-size: 18px;
  margin-top: 1rem;
  margin-bottom: 2rem;
  color: #aaa;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 12px 20px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

button:hover {
  background-color: #43a047;
  transform: scale(1.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
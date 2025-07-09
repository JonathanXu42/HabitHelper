<template>
  <div class="landing">
    <Header></Header>

    <h1>Hello World</h1>
    <div v-if="userStore.isLoggedIn">
      Welcome, {{ userStore.user.firstName + " " +  userStore.user.lastName }}!
    </div>

    <a class="view-progress-log" @click.prevent="$router.push('/progress-log')">View progress log</a>
  </div>

  <button class="add-button" @click="showModal = true">+</button>

  <HabitModal v-if="showModal" @close="showModal = false" />
</template>

<script>
import Header from '../components/Header.vue'
import HabitModal from '../components/HabitModal.vue'
import { useUserStore } from '../stores/userStore'

export default {
  name: 'Landing',
  components: { 
    Header,
    HabitModal
  },
  data() {
    return {
      userStore: null,
      showModal: false
    }
  },
  created() {
    this.userStore = useUserStore();
  }
};
</script>

<style scoped>
.landing {
  text-align: center;
  margin-top: 100px;
}

.add-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 24px;
  padding: 12px 18px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
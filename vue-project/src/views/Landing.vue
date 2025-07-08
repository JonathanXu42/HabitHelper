<template>
  <div class="landing">
    <Header></Header>

    <h1>Hello World</h1>
    <div v-if="userStore.isLoggedIn">
      Welcome, {{ userStore.user.firstName + " " +  userStore.user.lastName }}!
    </div>

    <a class="view-progress-log" @click.prevent="$router.push('/progress-log')">View progress log</a>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import { useUserStore } from '../stores/userStore'

export default {
  name: 'Landing',
  components: { 
    Header
  },
  data() {
    return {
      userStore: null
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
</style>
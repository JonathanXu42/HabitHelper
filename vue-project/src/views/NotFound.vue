<template>
  <Header v-if="userStore.isLoggedIn"></Header>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
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
}
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 4rem;
}
</style>
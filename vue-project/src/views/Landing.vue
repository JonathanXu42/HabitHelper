<template>
  <div class="landing">
    <Header></Header>

    <h1>Hello World</h1>
    <p v-if="email">Logged in as: {{ email }}</p>

    <a class="view-progress-log" @click.prevent="$router.push('/progress-log')">View progress log</a>
  </div>
</template>

<script>
import Header from '../components/Header.vue'

export default {
  name: 'Landing',
  components: { 
    Header
  },
  data() {
    return {
      email: null
    }
  },
  async mounted() {
    try {
      const res = await fetch('http://localhost:3000/api/me', {
        credentials: 'include'
      });
      if (res.ok) {
        const user = await res.json();
        this.email = user.email;
      }
    } catch (err) {
      console.error("Failed to load user info", err);
    }
  }
};
</script>

<style scoped>
.landing {
  text-align: center;
  margin-top: 100px;
}
</style>
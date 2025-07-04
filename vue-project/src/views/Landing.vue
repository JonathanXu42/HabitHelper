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
  mounted() {
    this.email = this.$route.query.email
  }
};
</script>

<style scoped>
.landing {
  text-align: center;
  margin-top: 100px;
}
</style>
<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    login() {
      if (this.email && this.password) {
        // Accept any email/password for now
        this.$router.push('/landing');
      } else {
        alert('Please fill out both fields!');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 8px;
  font-size: 14px;
}

button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>
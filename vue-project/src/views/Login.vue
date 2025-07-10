<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <TextInput type="email" v-model="email" placeholder="Email" autocomplete="email" required />
      <TextInput type="password" v-model="password" placeholder="Password" autocomplete="current-password" required />

      <a class="forgot-password" @click.prevent="$router.push('/reset-password')">Forgot password?</a>

      <button type="submit">Login</button>
    </form>

    <a class="create-account-link" @click.prevent="$router.push('/create-account')">Create an account</a>

    <button @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import TextInput from '../components/TextInput.vue';

export default {
  name: 'Login',
  components: {
    TextInput
  },
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        if (!response.ok) {
          const error = await response.json();
          return alert(error.message || 'Login failed');
        }

        const user = await response.json();
        this.$router.push('/landing');
      } catch (err) {
        alert('Login request failed');
      }
    },
    signInWithGoogle() {
      window.location.href = 'http://localhost:3000/auth/google';
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

button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

.forgot-password {
  color: blue;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  text-decoration: underline;
  display: inline-block;
}

.create-account-link {
  color: green;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  margin-top: 10px;
}
</style>
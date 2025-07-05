<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <TextInput type="email" v-model="email" placeholder="Email" autocomplete="email" required />
      <TextInput type="password" v-model="password" placeholder="Password" autocomplete="current-password" required />

      <a class="forgot-password" @click.prevent="$router.push('/reset-password')">Forgot password?</a>

      <button type="submit">Login</button>
    </form>

    <p class="create-account-link" @click="showSignup = !showSignup">Create an account.</p>

    <form v-if="showSignup" @submit.prevent="createAccount">
      <TextInput type="email" v-model="signupEmail" placeholder="Email" autocomplete="email" required />
      <TextInput type="password" v-model="signupPassword" placeholder="Password" autocomplete="new-password" required />
      <TextInput type="password" v-model="signupConfirm" placeholder="Confirm password" autocomplete="new-password" required />
      <button type="submit">Submit</button>
    </form>

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
      password: '',
      showSignup: false,
      signupEmail: '',
      signupPassword: '',
      signupConfirm: ''
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
    },
    signInWithGoogle() {
      window.location.href = 'http://localhost:3000/auth/google'
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
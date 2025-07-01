<template>
  <div class="login-container">
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click="login">Login</button>
    <button @click="showCreateAccount = true">Create new account</button>

    <div v-if="showCreateAccount" class="modal">
      <h3>Create Account</h3>
      <input v-model="newEmail" placeholder="Email" type="email" />
      <input v-model="newPassword" placeholder="Password" type="password" />
      <button @click="sendVerification">Send Verification Code</button>
      <div v-if="codeSent">
        <input v-model="verificationCode" placeholder="Enter Code" />
        <button @click="verifyCode">Verify and Create Account</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      newEmail: '',
      newPassword: '',
      verificationCode: '',
      showCreateAccount: false,
      codeSent: false
    };
  },
  methods: {
    async login() {
      // call backend login endpoint
    },
    async sendVerification() {
      // call backend to send verification code
      this.codeSent = true;
    },
    async verifyCode() {
      // call backend to verify code and create account
      this.showCreateAccount = false;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
}
.modal {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>
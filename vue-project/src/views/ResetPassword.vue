<template>
  <div class="reset-password">
    <h1>Reset Password</h1>

    <form @submit.prevent="emailVerificationCode">
      <TextInput
        type="email"
        :modelValue="email"
        @update:modelValue="email = $event"
        placeholder="Email"
        required
      />
      <button type="submit">Reset password</button>
    </form>

    <form v-if="codeSent" @submit.prevent="verifyCode">
      <TextInput
        type="text"
        :modelValue="enteredCode"
        @update:modelValue="enteredCode = $event"
        placeholder="Enter 6-digit code"
        required
      />
      <button type="submit">Verify</button>
    </form>
  </div>
</template>

<script>
import TextInput from '../components/TextInput.vue';

export default {
  name: 'ResetPassword',
  components: {
    TextInput
  },
  data() {
    return {
      email: '',
      codeSent: false,
      enteredCode: '',
      verificationCode: ''
    };
  },
  methods: {
    async emailVerificationCode() {
      if (!this.email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        const response = await fetch('/api/send-verification-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });

        const result = await response.json();
        if (result.success) {
          this.verificationCode = result.code.toString();
          this.codeSent = true;
          alert(`Verification code sent to ${this.email}`);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error sending verification code:', error);
        alert('There was a problem sending the verification code.');
      }
    },

    verifyCode() {
      if (this.enteredCode === this.verificationCode) {
        alert('Verification successful!');
        // next step: show password reset form
      } else {
        alert('Incorrect verification code.');
      }
    }
  }
};
</script>

<style scoped>
.reset-password {
  text-align: center;
  margin-top: 100px;
}

button {
  margin-top: 10px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>
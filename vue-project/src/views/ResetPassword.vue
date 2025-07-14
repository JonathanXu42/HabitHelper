<template>
  <div class="reset-password">
    <Header v-if="userStore.isLoggedIn"></Header>
    <h1>Reset Password</h1>

    <form @submit.prevent="emailVerificationCode">
      <TextInput
        type="email"
        :modelValue="email"
        @update:modelValue="email = $event"
        placeholder="Email"
        required
      />
      <button type="submit">Verify email</button>
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

    <form v-if="codeVerified" @submit.prevent="submitNewPassword">
      <TextInput
        type="password"
        :modelValue="newPassword"
        @update:modelValue="newPassword = $event"
        placeholder="New Password"
        autocomplete="new-password"
        required
      />
      <TextInput
        type="password"
        :modelValue="confirmPassword"
        @update:modelValue="confirmPassword = $event"
        placeholder="Confirm New Password"
        autocomplete="new-password"
        required
      />
      <button type="submit">Set New Password</button>
    </form>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import TextInput from '../components/TextInput.vue';
import { useUserStore } from '../stores/userStore';

export default {
  name: 'ResetPassword',
  components: {
    Header,
    TextInput
  },
  data() {
    return {
      email: '',
      codeSent: false,
      enteredCode: '',
      codeVerified: false,
      userStore: null
    };
  },
  created() {
    this.userStore = useUserStore();
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

    async verifyCode() {
        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: this.email,
                    code: this.enteredCode
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Verification successful!');
                this.codeVerified = true;
            } else {
                alert(result.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            alert('Verification failed');
        }
    },

    async submitNewPassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            newPassword: this.newPassword
          })
        });

        const result = await response.json();
        if (result.success) {
          alert('Password updated successfully!');
          this.$router.push('/landing');
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Password reset error:', error);
        alert('Failed to reset password.');
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
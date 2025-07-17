<template>
  <Header v-if="userStore.isLoggedIn"></Header>
  <div class="reset-password">
    <h1 class="title">Reset Password</h1>

    <form @submit.prevent="emailVerificationCode" class="form-inline">
      <input
        class="text-input"
        type="email"
        v-model="email"
        placeholder="Email"
        required
      />
      <button type="submit">Verify email</button>
    </form>

    <form v-if="codeSent" @submit.prevent="verifyCode">
      <input
        class="text-input"
        type="text"
        v-model="enteredCode"
        placeholder="Enter 6-digit code"
        required
      />
      <button type="submit">Verify</button>
    </form>

    <form v-if="codeVerified" @submit.prevent="submitNewPassword">
      <input
        class="text-input"
        type="password"
        v-model="newPassword"
        placeholder="New Password"
        autocomplete="new-password"
        required
      />
      <input
        class="text-input"
        type="password"
        v-model="confirmPassword"
        placeholder="Confirm New Password"
        autocomplete="new-password"
        required
      />
      <button type="submit">Set New Password</button>
    </form>
    
    <p>
      <a class="login-page-link" @click.prevent="$router.push('/')">Remembered your password? Log in here</a>
    </p>
    <br>
    <a class="create-account-link" @click.prevent="$router.push('/create-account')">Don't have an account? Create one here</a>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import { useUserStore } from '../stores/userStore';
import { fetchWithCsrf } from '../stores/csrfStore';

export default {
  name: 'ResetPassword',
  components: {
    Header
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
    if (this.userStore.user) {
      this.email = this.userStore.user.email;
    }
  },
  methods: {
    async emailVerificationCode() {
      if (!this.email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        const response = await fetchWithCsrf('/api/send-verification-code', {
          method: 'POST',
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
            const response = await fetchWithCsrf('/api/verify-code', {
              method: 'POST',
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
        const response = await fetchWithCsrf('/reset-password', {
          method: 'POST',
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
  text-align: left;
  margin-top: 30px;
}

.title {
  text-align: center;
  margin-bottom: 50px;
}

form {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.text-input {
  height: 40px;
  width: 275px;
  font-size: 16px;
  border-radius: 16px;
}

button {
  background-color: #0BDA51;
  width: 250px;
  height: 50px;
  transition-duration: 0.4s;
  border-radius: 12px;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

button:hover {
  background-color: green;
  color: white;  
}

button:active { 
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.login-page-link {
  color: rgb(65, 65, 217);
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
}
</style>
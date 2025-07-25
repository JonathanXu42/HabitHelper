<template>
  <div class="create-account-container">
    <div class="form-card">
      <h2>Create Your Account</h2>
      <form @submit.prevent="handleInitialSubmit" v-if="!codeSent">
        <input type="text" v-model="signupFirstName" placeholder="First Name" autocomplete="given-name" />
        <input type="text" v-model="signupLastName" placeholder="Last Name" autocomplete="family-name" />
        <input type="email" v-model="signupEmail" placeholder="Email" autocomplete="email" required />
        <input type="password" v-model="signupPassword" placeholder="Password" autocomplete="new-password" required />
        <input type="password" v-model="signupConfirm" placeholder="Confirm Password" autocomplete="new-password" required />

        <label for="timezone">Timezone</label>
        <multiselect
          id="timezone"
          v-model="signupTimezone"
          :options="timezones"
          track-by="name"
          label="label"
          placeholder="Select your timezone"
          required
          class="dark-multiselect"
        />

        <button type="submit">Submit</button>
      </form>

      <form v-else @submit.prevent="verifyCode">
        <p class="verify-instructions">A 6-digit code has been sent to {{ signupEmail }}</p>
        <input type="text" v-model="enteredCode" placeholder="Enter 6-digit code" required />
        <button type="submit">Verify</button>
      </form>

      <a class="login-page-link" @click.prevent="$router.push('/')">Already have an account? Log in here</a>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { useTimezoneStore } from '../stores/timezoneStore';
import { fetchWithCsrf } from '../stores/csrfStore';
import { useToast } from 'vue-toastification';

export default {
  name: 'Create-Account',
  components: {
    Multiselect
  },
  data() {
    return {
      signupFirstName: '',
      signupLastName: '',
      signupEmail: '',
      signupPassword: '',
      signupConfirm: '',
      signupTimezone: null,
      timezoneStore: null,
      timezones: [],
      codeSent: false,
      enteredCode: '',
      codeVerified: false,
      toast: null
    };
  },
  created() {
    this.timezoneStore = useTimezoneStore();
    this.timezoneStore.initTimezones();
    this.timezones = this.timezoneStore.timezones;
    this.signupTimezone = this.timezoneStore.guessDefault();

    this.toast = useToast();
  },
  methods: {
    async handleInitialSubmit() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.signupEmail)) {
        this.toast.warning('Please enter a valid email address');
        return;
      }

      if (this.signupPassword !== this.signupConfirm) {
        this.toast.warning('Passwords do not match');
        return;
      }

      try {
        const checkRes = await fetchWithCsrf('/auth/check-existing-account', {
          method: 'POST',
          body: JSON.stringify({ email: this.signupEmail })
        });

        const checkResult = await checkRes.json();
        if (!checkResult.success) {
          this.toast.warning(checkResult.message);
          return;
        }
      } catch (err) {
        console.error('Error checking email:', err);
        this.toast.error('Failed to check email availability');
        return;
      }

      try {
        const response = await fetchWithCsrf('/api/send-verification-code', {
          method: 'POST',
          body: JSON.stringify({ email: this.signupEmail })
        });

        const result = await response.json();
        if (result.success) {
          this.codeSent = true;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error sending verification code:', error);
        this.toast.error('There was a problem sending the verification code');
      }
    },

    async verifyCode() {
      try {
        const response = await fetchWithCsrf('/api/verify-code', {
          method: 'POST',
          body: JSON.stringify({
            email: this.signupEmail,
            code: this.enteredCode
          })
        });

        const result = await response.json();

        if (response.status === 429) {
          this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
          return;
        }

        if (result.success) {
          this.toast.success('Verification successful!');
          this.codeVerified = true;
          this.createAccount();
        } else {
          this.toast.error(result.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        this.toast.error('Verification failed');
      }
    },

    async createAccount() {
      try {
        const response = await fetchWithCsrf('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            firstName: this.signupFirstName,
            lastName: this.signupLastName,
            email: this.signupEmail,
            password: this.signupPassword,
            timezone: this.signupTimezone.name
          })
        });

        if (!response.ok) {
          const error = await response.json();
          this.toast.error(error.error || 'Signup failed');
          return;
        }

        const user = await response.json();
        this.$router.push('/landing');
      } catch (err) {
        console.error('Signup request failed:', err);
        this.toast.error('Signup request failed');
      }
    }
  }
};
</script>

<style scoped>
.create-account-container {
  background-color: #121212;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.form-card {
  background-color: #1f1f1f;
  color: #f0f0f0;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #4caf50;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input,
textarea {
  padding: 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2c2c2c;
  color: #f0f0f0;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4caf50;
}

label {
  font-weight: bold;
  margin-top: 1rem;
}

button {
  padding: 12px;
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

button:hover {
  background-color: #43a047;
  transform: scale(1.03);
}

.verify-instructions {
  text-align: center;
  font-size: 0.95rem;
  color: #ccc;
}

.dark-multiselect .multiselect__input,
.dark-multiselect .multiselect__single {
  background-color: #2c2c2c;
  color: #f0f0f0;
}

.dark-multiselect .multiselect__content-wrapper {
  background-color: #2c2c2c;
  border: 1px solid #444;
}

.dark-multiselect .multiselect__option--highlight {
  background-color: #4caf50;
  color: #fff;
}

.login-page-link {
  color: green;
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
}
</style>
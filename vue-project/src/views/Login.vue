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
      <TextInput type="firstName" v-model="signupFirstName" placeholder="First Name" autocomplete="given-name" />
      <TextInput type="lastName" v-model="signupLastName" placeholder="Last Name" autocomplete="family-name" />
      <TextInput type="email" v-model="signupEmail" placeholder="Email" autocomplete="email" required />
      <TextInput type="password" v-model="signupPassword" placeholder="Password" autocomplete="new-password" required />
      <TextInput type="password" v-model="signupConfirm" placeholder="Confirm password" autocomplete="new-password" required />
      
      <label for="timezone">Timezone</label>
      <multiselect
        id="timezone"
        v-model="signupTimezone"
        :options="timezones"
        track-by="name"
        label="label"
        placeholder="Select your timezone"
        required
      />

      <button type="submit">Submit</button>
    </form>

    <button @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import TextInput from '../components/TextInput.vue';
import moment from 'moment-timezone';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'Login',
  components: {
    TextInput,
    Multiselect
  },
  data() {
    return {
      email: '',
      password: '',
      showSignup: false,
      signupFirstName: '',
      signupLastName: '',
      signupEmail: '',
      signupPassword: '',
      signupTimezone: null,
      signupConfirm: '',
      timezones: []
    };
  },
  mounted() {
    // Populate timezone list with offsets
    this.timezones = moment.tz.names().map(tz => {
      const offsetMinutes = moment.tz(tz).utcOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
      const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
      const offset = `UTC${sign}${hours}:${minutes}`;
      return {
        name: tz,
        label: `${tz} (${offset})`
      };
    });

    const guessedName = moment.tz.guess();

    // Find the full object in timezones that matches the guessed timezone name
    this.signupTimezone = this.timezones.find(tz => tz.name === guessedName) || null;
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
    async createAccount() {
      if (this.signupPassword !== this.signupConfirm) {
        return alert('Passwords do not match');
      }

      try {
        const response = await fetch('http://localhost:3000/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          return alert(error.error || 'Signup failed');
        }

        const user = await response.json();
        this.$router.push('/landing');
      } catch (err) {
        alert('Signup request failed');
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
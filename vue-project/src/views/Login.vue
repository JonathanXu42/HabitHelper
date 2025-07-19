<template>
  <div class="login-container">
    <div class="app-brand">
      <h1 class="app-title">
        <img src="../../public/habithelper_favicon.png" alt="H" class="logo-letter"/>
        ABIT
        <img src="../../public/habithelper_favicon.png" alt="H" class="logo-letter"/>
        ELPER
      </h1>
      <p class="app-subtitle">Keeping you on track with your goals, one day at a time</p>
    </div>

    <div class="login-box">
      <form @submit.prevent="login">
        <input class="text-input" type="email" v-model="email" placeholder="Email" autocomplete="email" required />
        <input class="text-input" type="password" v-model="password" placeholder="Password" autocomplete="current-password" required />

        <a class="forgot-password" @click.prevent="$router.push('/reset-password')">Forgot password?</a>

        <button class="login-button" type="submit">Login</button>
      </form>

      <button class="google-button" @click="signInWithGoogle">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="google-logo" />
        Sign in with Google
      </button>

      <a class="create-account-link" @click.prevent="$router.push('/create-account')">Create an account</a>
    </div>
  </div>
</template>

<script>
import { fetchWithCsrf } from '../stores/csrfStore';
import { useToast } from 'vue-toastification';

export default {
  name: 'Login',
  components: {
  },
  data() {
    return {
      email: '',
      password: '',
      toast: null
    };
  },
  created() {
    this.toast = useToast();
  }, 
  methods: {
    async login() {
      try {
        const response = await fetchWithCsrf('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        const result = await response.json();

        if (response.status === 429) {
          this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
          return;
        }

        if (!response.ok) {
          return this.toast.error(result.message || 'Login failed');
        }

        this.$router.push('/landing');
      } catch (err) {
        this.toast.error('Login request failed');
      }
    },
    signInWithGoogle() {
      window.location.href = '/auth/google';
    }
  }
};
</script>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* full screen height */
  padding: 20px;
  gap: 100px; /* spacing between left and right */
  flex-wrap: wrap; /* allows wrapping when screen is small */
}

/* Left Side */
.app-brand {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.app-title {
  color: white;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.logo-letter {
  height: 1.1em;
  vertical-align: -9px;
  display: inline-block;
  margin-right: -15px;
}

.app-subtitle {
  color: white;
  font-size: 20px;
  line-height: 1.5;
}

.login-box {
  background-color: white;
  border-radius: 12px;
  padding: 30px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* ✅ Responsive Breakpoint: Stack vertically on small screens */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  .app-brand {
    text-align: center;
  }

  .app-title {
    font-size: 36px;
  }

  .app-subtitle {
    font-size: 16px;
  }
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-input {
  height: 40px;
  font-size: 16px;
  border-radius: 16px;
}

.forgot-password {
  color: blue;
  cursor: pointer;
  font-size: 16px;
  text-decoration: underline;
}

.login-button {
  background-color: #0BDA51;
  transition-duration: 0.4s;
  border-radius: 12px;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

.login-button:hover{
  background-color: green;
  color: white;  
}

/* Adds a "pressed" effect on click */
.login-button:active { 
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.google-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border: 3px solid #ccc;
  border-radius: 8px;
  background-color: white;
  transition: background-color 0.2s;
}

.google-button:hover {
  background-color: #D3D3D3;
}

.google-logo {
  height: 20px;
  width: 20px;
}

.create-account-link {
  color: green;
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
  margin-top: 10px;
}
</style>
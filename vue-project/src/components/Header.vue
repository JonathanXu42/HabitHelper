<template>
  <header class="main-header">
    <nav class="nav-container">
      <a
        v-for="(link, index) in navLinks"
        :key="index"
        :href="link.href"
        class="nav-link"
      >
        {{ link.label }}
      </a>
      <button @click="logout" class="nav-link">Sign Out</button>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      navLinks: [
        { label: 'Home', href: '/landing' },
        { label: 'Progress Log', href: '/progress-log' },
        { label: 'Reset Password', href: '/reset-password' },
      ]
    }
  },
  methods: {
    logout() {
      fetch('http://localhost:3000/auth/logout', {
        method: 'GET',
        credentials: 'include' // ensures session cookie is sent
      })
        .then(() => {
          window.location.href = '/' // redirect after logout
        })
        .catch(err => {
          console.error('Logout failed:', err)
        })
    }
  }
}
</script>

<style>
.main-header {
  width: 100%;
  background-color: #333;
  padding: 1rem 0;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
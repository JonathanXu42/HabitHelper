<template>
  <header class="main-header">
    <nav class="nav-container">
      <a class="logo-wrapper" href='/landing'>
        <img class="logo-corner" src="../../public/habithelper_favicon.png"/>
      </a>

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
        { label: 'Progress Log', href: '/progress-log' },
        { label: 'Reset Password', href: '/reset-password' },
        { label: 'Settings', href: '/settings'}
      ]
    }
  },
  methods: {
    logout() {
      fetch('/auth/logout', {
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
  background-color: #333;
  padding: 1rem 0;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0;
  flex-wrap: wrap;
}

.logo-corner {
  vertical-align: bottom;
  height: 45px;
}

.logo-corner:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
}

.nav-link {
  background: #333;
  border: none;
  color: white;
  font-size: 20px;
  border-radius: 12px;
  text-decoration: none;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
</style>
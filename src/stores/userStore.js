import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null // e.g. { id, email, firstName, lastName, ... }
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async fetchUser() {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Not logged in');
        this.user = await res.json();
      } catch (err) {
        this.user = null;
      }
    },
    logout() {
      this.user = null;
    }
  },
  persist: {
    storage: sessionStorage,
    paths: ['user']
  }
})
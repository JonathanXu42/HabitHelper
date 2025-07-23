import { defineStore } from 'pinia';

export const useCsrfStore = defineStore('csrf', {
  state: () => ({
    csrfToken: null,
  }),
  actions: {
    async fetchCsrfToken() {
      try {
        const res = await fetch('/api/csrf-token', {
          credentials: 'include',
        });
        const data = await res.json();
        this.csrfToken = data.csrfToken;
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    },
  },
});

export async function fetchWithCsrf(url, options = {}) {
  const csrfStore = useCsrfStore();

  const headers = {
    'Content-Type': 'application/json',
    'csrf-token': csrfStore.csrfToken,
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}
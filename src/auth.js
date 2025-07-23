// src/auth.js
export async function checkAuth() {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Not authenticated");
    const user = await res.json();
    return user;
  } catch (err) {
    return null;
  }
}
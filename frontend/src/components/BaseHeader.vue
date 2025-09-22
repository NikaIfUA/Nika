<template>
  <header class="header">
    <nav class="nav-left">
      <div class="nav-left-inner">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/info">Info</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
      </div>
    </nav>
    <div class="nav-right">
      <RouterLink v-if="!isAuthenticated" to="/auth">Login / Register</RouterLink>
      <RouterLink v-else to="/" class="logout-button" @click.prevent="logout">Logout</RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { RouterLink, useRouter } from 'vue-router';
  import { computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  const auth = useAuthStore();
  const isAuthenticated = computed(() => auth.isAuthenticated());

  function logout() {
    auth.logout();
  }
</script>

<style scoped>
.header {
  height: 120px;
  width: 100vw;
  background-color: #024ea0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-left-inner {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-right: 1.5rem;
}

.header a {
  height: 60px;
  color: white;
  text-decoration: none;
  padding: 1rem;
  margin-top: 20px;
  border: 1px solid white;
  text-align: center;
  border-radius: 5px;
}

.header a:hover {
  background-color: white;
  color: #007bff;
}

.logo {
  width: 250px;
  height: auto;
}
.logout-button {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.logout-button:hover {
  background: #ff6b6b;
}
</style>
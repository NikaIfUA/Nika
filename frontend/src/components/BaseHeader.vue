<template>
  <header class="header">
    <nav>
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/info">Info</RouterLink>
      <RouterLink to="/admin">Admin</RouterLink>
      <RouterLink to="/auth">Login / Register</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { RouterLink } from 'vue-router';
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

.header nav {
  display: flex;
  gap: 1rem;
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
</style>
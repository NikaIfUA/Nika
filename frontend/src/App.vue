<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <nav>
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main> 
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #024ea0;
  color: white;
  padding: 1rem;
  position: fixed; 
  top: 0;
  left: 0;
  height: 100%;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar a {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border: 1px solid white;
  text-align: center;
  border-radius: 5px;
}

.sidebar a:hover {
  background-color: white;
  color: #007bff;
}

.content {
  margin-left: 10px;
  flex-grow: 1;
  padding: 1rem;
}
</style>

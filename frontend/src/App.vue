<script setup lang="ts">
import { RouterView } from 'vue-router';
import BaseHeader from './components/BaseHeader.vue';
</script>

<template>
  <div class="layout">
<<<<<<< Updated upstream
    <BaseHeader />
=======
    <header class="header">
      <nav>
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>
>>>>>>> Stashed changes
    <main class="content">
      <RouterView />
    </main> 
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

<<<<<<< Updated upstream
.content {
  flex-grow: 1;
  padding: 1rem;
  margin-top: 10rem;
=======
.header {
  width: 100%;
  background-color: #024ea0;
  color: white;
  padding: 0.5rem;
  position: fixed; 
  top: 0;
  left: 0;
  z-index: 1000;
}

.header nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header .logo {
  height: 80px;
  margin-left: 4rem;
  margin-right: 36rem;
}
.header a {
  color: white;
  text-decoration: none;
  padding: 0.3rem;
  border: 1px solid white;
  text-align: center;
  border-radius: 5px;
}

.header a:hover {
  background-color: white;
  color: #007bff;
}

.content {
  margin-top: 150px; 
  flex-grow: 1;
  padding: 1rem;
  margin-left: 1rem; 
  margin-right: 1rem;
>>>>>>> Stashed changes
}
</style>

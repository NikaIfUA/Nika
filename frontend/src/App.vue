<script setup lang="ts">
import { RouterView } from 'vue-router';
import BaseHeader from './components/BaseHeader.vue';
</script>

<template>
  <div class="layout">
    <BaseHeader />
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

.content {
  flex-grow: 1;
  padding: 1rem;
  margin-top: 10rem;
}
</style>

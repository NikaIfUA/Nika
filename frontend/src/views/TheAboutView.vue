<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h3>{{ message }}</h3>
  </div>
</template>

<script setup lang="ts">
  const message = "Here you can find information about the project and its components";
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column; 
  align-items: normal; 
  gap: 1rem;
  padding: 2rem;
}
</style>

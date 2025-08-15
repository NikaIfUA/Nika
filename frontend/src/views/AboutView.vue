<script setup lang="ts">
import { ref } from "vue";

const message = ref('')
const showMessage = ref(false)

const fetchInfo = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/data');
    if (response.ok) {
      const data = await response.json();
      message.value = data.message;
      showMessage.value = true;
    }
    else {
      message.value = 'Failed to fetch data from backend';
      showMessage.value = true;
    }
    } catch (error) {
    console.error('Error fetching info:', error)
  }
}
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <a class="button" @click="fetchInfo">Get info from backend</a>
    <p v-if="showMessage">{{ message }}</p>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column; /* Розташування елементів зверху вниз */
  align-items: normal; /* Центруємо елементи по горизонталі */
  gap: 1rem; /* Відступ між елементами */
  padding: 2rem; /* Додаємо внутрішній відступ */
}
</style>

<script setup lang="ts">
import { ref } from "vue";

const message = ref('')
const txtmessage = ref('')
const showMessage = ref(false)

const fetchInfo = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/info');
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

const fetchHomeInfo = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/home');
    if (response.ok) {
      const data = await response.json();
      txtmessage.value = data.text;
      showMessage.value = true;
    }
    else {
      message.value = 'Failed to fetch home info from backend';
      showMessage.value = true;
    }
  } catch (error) {
    console.error('Error fetching home info:', error)
  }
}
</script>

<template>
  <h1>This is the info page.</h1>
  <div class="button-container">
    <a class="button" @click="fetchInfo">Get info from backend</a>
    <p v-if="showMessage">{{ message }}</p>
    <a class="button" @click="fetchHomeInfo">Get txt file from backend</a>
    <p v-if="showMessage">{{ txtmessage }}</p>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start; /* Align buttons to the left */
}

.button {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem;
  border: 1px solid white;
  text-align: center;
  border-radius: 5px;
  display: inline-block;
  background-color: #007bff;
  cursor: pointer;
}

.button:hover {
  background-color: #509cee;
  color: #bed7f1;
}
</style>
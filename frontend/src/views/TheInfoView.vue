<template>
  <h1>This is the info page.</h1>
  <div class="button-container">
    <a class="button" @click="handleGetInfoButtonClick">
      Get info from backend
    </a>
    <p>{{ infoFromBackend }}</p>

    <a class="button" @click="handleGetFileContentButtonClick">
      Get txt file from backend
    </a>
    <p>{{ fileContentFromStorage }}</p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import mainApi from '@/api/main.api';

  const infoFromBackend = ref('');
  const fileContentFromStorage = ref('');

  const handleGetInfoButtonClick = async () => {
    try {
      const response = await mainApi.getInfo();
      if (response.status === 200) {
        infoFromBackend.value = response.data;
      }
      else {
        infoFromBackend.value = 'Failed to fetch data from backend';
      }
      } catch (error) {
      console.error('Error fetching info:', error)
    }
  }

  const handleGetFileContentButtonClick = async () => {
    try {
      const response = await mainApi.getFileContent('text.txt');
      if (response.status === 200) {
        fileContentFromStorage.value = response.data;
      }
      else {
        fileContentFromStorage.value = 'Failed to fetch home info from backend';
      }
    } catch (error) {
      console.error('Error fetching home info:', error)
    }
  }
</script>

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
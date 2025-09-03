<template>
  <RouterLink to="/admin">Go back</RouterLink>
  <div>
    <h2>Add Category</h2>
    <form @submit.prevent="onSubmit">
      <BaseInput type="text" v-model="categoryName" placeholder="Enter category name" />
      <button type="submit">Create</button>
      <p v-if="message">{{ message }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios'; // 1. Імпортуємо axios
import { API_URL } from '@/env';
import BaseInput from '@/components/BaseInput.vue';

// Реактивний стан залишається без змін
const categoryName = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('error');
const isLoading = ref(false);

// Обробка відправки форми
async function onSubmit() {
  message.value = '';
  if (!categoryName.value.trim()) {
    message.value = 'Будь ласка, введіть назву категорії.';
    messageType.value = 'error';
    return;
  }

  isLoading.value = true;

  try {
    // 2. Використовуємо axios.post для відправки запиту
    // Він автоматично перетворить об'єкт на JSON і встановить правильні заголовки
    const response = await axios.post(`${API_URL}/create-category`, {
      name: categoryName.value.trim(),
    });

    // 3. Обробка успішної відповіді
    message.value = response.data.message || 'Категорію успішно створено!';
    messageType.value = 'success';
    categoryName.value = ''; // Очищуємо поле вводу

  } catch (error) {
    // 4. Обробка помилок (мережевих або від сервера)
    // axios автоматично викидає помилку для статусів 4xx/5xx
    if (axios.isAxiosError(error) && error.response) {
      // Використовуємо повідомлення про помилку з сервера
      message.value = error.response.data.error || `Не вдалося створити категорію.`;
    } else {
      // Загальна помилка (наприклад, проблема з мережею)
      message.value = 'Виникла помилка під час зʼєднання з сервером.';
    }
    messageType.value = 'error';
    console.error('Form submission error:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="upload-form">
    <h2>Upload New Category</h2>
    <BaseInput
      v-model="categoryName"
      label="Category Name"
      type="text"
      placeholder="Enter category name"
    />
    <BaseButton :disabled="uploading" @click="uploadCategory">
      Create Category
    </BaseButton>
    <div v-if="successMessage" class="upload-message success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="upload-message error">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from './BaseButton.vue';
import mainApi from '@/api/main.api';
import { isAxiosError } from 'axios';

const emit = defineEmits(['uploaded']);

const categoryName = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const uploading = ref(false);

async function uploadCategory() {
  if (!categoryName.value || !categoryName.value.trim()) {
    errorMessage.value = 'Please enter a category name.';
    successMessage.value = '';
    return;
  }

  successMessage.value = '';
  errorMessage.value = '';

  try {
    uploading.value = true;
    const payload = { name: categoryName.value.trim() };

    const response = await mainApi.saveCategory(payload);
    const created = response.data;

    successMessage.value = 'Category created successfully.';
    categoryName.value = '';
    emit('uploaded', created);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.response?.data?.error ?? err.message)
      : (err as Error)?.message ?? String(err);

    errorMessage.value = message;
  } finally {
    uploading.value = false;
  }
}
</script>

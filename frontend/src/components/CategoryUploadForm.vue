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
import { API_URL } from '@/env';

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
    const payload = { name: categoryName.value.trim() };

    const res = await fetch(`${API_URL}/save-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = res.statusText;

      const json = await res.json();
      errMsg = json?.message || json?.error || errMsg;

      errorMessage.value = `Failed to create category: ${errMsg}`;
      return;
    }

    const created = await res.json().catch(() => null);
    successMessage.value = 'Category created successfully.';
    categoryName.value = '';

    emit('uploaded', created);
  } catch (err: any) {
    errorMessage.value = err?.message || String(err);
  }
}
</script>

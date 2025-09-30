<template>
  <div class="upload-form">
    <h2>Upload New Material</h2>
    <BaseInput
      v-model="materialName"
      label="Material Name"
      type="text"
      placeholder="Enter material name"
    />
    <BaseButton :disabled="uploading" @click="uploadMaterial">
      Create Material
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

const materialName = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const uploading = ref(false);

async function uploadMaterial() {
  if (!materialName.value || !materialName.value.trim()) {
    errorMessage.value = 'Please enter a material name.';
    successMessage.value = '';
    return;
  }

  successMessage.value = '';
  errorMessage.value = '';

  try {
    uploading.value = true;
    const payload = { name: materialName.value.trim() };

    const response = await mainApi.saveMaterial(payload);
    const created = response.data;

    successMessage.value = 'Material created successfully.';
    materialName.value = '';

    emit('uploaded', created);
  } catch (err: unknown) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.response?.data?.error ?? err.message)
      : (err as Error)?.message ?? String(err);

    errorMessage.value = message;
  } finally {
    uploading.value = false;
  }
}
</script>

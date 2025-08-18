<!-- In your Vue component -->
<script setup lang="ts">
import { ref } from 'vue';
import type { IImage } from '@/model/IImage';
import { API_URL } from '@/env';

const selectedFile = ref<File | null>(null);

function onFileChanged(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

async function uploadImage() {
  if (!selectedFile.value) {
    alert('Please select a file first!');
    return;
  }

  const formData = new FormData();
  formData.append('imageFile', selectedFile.value);
  formData.append('altText', 'A beautiful landscape');
  // TODO: Add alt text text input
  // TODO: Add more metadata fields

  const response = await fetch(`${API_URL}/save-image`, {
    method: 'POST',
    body: formData,
  });

  const newImage: IImage = await response.json();
  console.log('Successfully uploaded:', newImage);
}
</script>

<template>
  <input type="file" @change="onFileChanged" accept="image/*" />
  <button @click="uploadImage">Upload</button>
</template>
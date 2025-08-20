<!-- In your Vue component -->
<template>
  <input type="file" @change="onFileChanged" accept="image/*" />
  <button @click="uploadImage">Upload</button>
  <BaseInput type="text" v-model="imageName" placeholder="Enter image name" />
  <BaseInput type="text" v-model="imageDescription" placeholder="Enter image description" />
  <BaseInput type="text" v-model="imageCategory" placeholder="Enter image category" />
  <BaseInput type="text" v-model="imagePrice" placeholder="Enter image price" />
  <BaseInput type="text" v-model="imageAmountAvailable" placeholder="Enter amount available" />
  <BaseInput type="text" v-model="imageMaterialIds" placeholder="Enter material IDs (comma-separated)" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { IImage } from '@/interfaces';
  import { API_URL } from '@/env';
  import BaseInput from '@/components/BaseInput.vue';

  const selectedFile = ref<File | null>(null);
  const imageName = ref<string>('');
  const imageDescription = ref<string>('');
  const imageCategory = ref<string>('');
  const imagePrice = ref<string>('');
  const imageAmountAvailable = ref<string>('');
  const imageMaterialIds = ref<string>('');

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
    formData.append('imageName', imageName.value);
    formData.append('imageDescription', imageDescription.value);
    formData.append('categoryId', imageCategory.value);
    formData.append('price', imagePrice.value);
    formData.append('amountAvailable', imageAmountAvailable.value);
    formData.append('materialIds', JSON.stringify(imageMaterialIds.value.split(',')));

    const response = await fetch(`${API_URL}/save-image`, {
      method: 'POST',
      body: formData,
    });

    const newImage: IImage = await response.json();
    console.log('Successfully uploaded:', newImage);
  }
</script>
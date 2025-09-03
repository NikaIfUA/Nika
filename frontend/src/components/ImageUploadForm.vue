<template>
  <RouterLink to="/admin">Go back</RouterLink>
  <div class="image-upload-form">
    <input type="file" @change="onFileChanged" accept="image/*" />
    <BaseButton @click="uploadImage">Upload</BaseButton>
    <p v-if="message">{{ message }}</p>
    <BaseInput type="text" v-model="imageName" placeholder="Enter image name" />
    <BaseInput type="text" v-model="imageDescription" placeholder="Enter image description" />
    <BaseSelectBox :options="categories.map((category: { id: string; name: string }) => 
    ({ value: category.id, label: category.name }))" v-model="imageCategory" />

    <BaseInput type="text" v-model="imagePrice" placeholder="Enter image price" />
    <BaseInput type="text" v-model="imageAmountAvailable" placeholder="Enter amount available" />

    <BaseSelectBox
      :options="materials.map((material: { id: string; name: string }) => 
      ({ value: material.id, label: material.name }))"
      v-model="imageMaterialIds"
      multiple
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { IImage } from '@/interfaces';
import BaseInput from '@/components/BaseInput.vue';
import BaseSelectBox from './BaseSelectBox.vue';
import BaseButton from './BaseButton.vue';
import { API_URL } from '@/env';

const emit = defineEmits<{
  (e: 'uploaded', payload: IImage): void;
}>();

const categories = ref<Array<{ id: string; name: string }>>([]);
const materials = ref<Array<{ id: string; name: string }>>([]);
const message = ref('');
const selectedFile = ref<File | null>(null);
const imageName = ref<string>('');
const imageDescription = ref<string>('');
const imageCategory = ref<string>('');
const imagePrice = ref<string>('');
const imageAmountAvailable = ref<string>('');
const imageMaterialIds = ref<string[]>([]);

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
  formData.append('materialIds', JSON.stringify(imageMaterialIds.value));

  const response = await fetch(`${API_URL}/save-image`, {
    method: 'POST',
    body: formData,
  });

  const newImage: IImage = await response.json();
  emit('uploaded', newImage);
  message.value = response.ok ? 'Image uploaded successfully!' : 'Upload failed.';
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/get-categories`);
    if (res.ok) categories.value = await res.json();
  } catch (e) {
    console.error('Error fetching categories', e);
  }
}

async function fetchMaterials() {
  try {
    const res = await fetch(`${API_URL}/get-materials`);
    if (res.ok) materials.value = await res.json();
  } catch (e) {
    console.error('Error fetching materials', e);
  }
}

onMounted(() => {
  fetchCategories();
  fetchMaterials();
});
</script>

<style scoped>
.image-upload-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

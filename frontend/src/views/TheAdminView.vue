<template>
  <ImageUploadForm :apiUrl="API_URL" :categories="categories" :materials="materials" @uploaded="onUploaded" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUploadForm from '@/components/ImageUploadForm.vue';
import { API_URL } from '@/env';

const categories = ref<Array<{ id: string; name: string }>>([]);
const materials = ref<Array<{ id: string; name: string }>>([]);

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

fetchCategories();
fetchMaterials();

function onUploaded(image: any) {
  console.log('Successfully uploaded:', image);
}
</script>
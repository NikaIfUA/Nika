<template>
  <div class="image-upload-form">
    <BaseInput type="file" @change="onFileChanged" accept="image/*" />
    <BaseButton :disabled="uploading" @click="uploadImage">{{ uploading ? 'Uploading...' : 'Upload' }}</BaseButton>
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

    <div v-if="successMessage" class="upload-message success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="upload-message error">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '@/env';
import mainApi from '@/api/main.api';
import { isAxiosError } from 'axios';
import type { IImage } from '@/interfaces';
import BaseInput from '@/components/BaseInput.vue';
import BaseSelectBox from './BaseSelectBox.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  apiUrl?: string;
}>();

const apiUrl = props.apiUrl ?? API_URL;

const emit = defineEmits<{
  (e: 'uploaded', payload: IImage): void;
}>();

const categories = ref<Array<{ id: string; name: string }>>([]);
const materials = ref<Array<{ id: string; name: string }>>([]);

async function fetchCategories() {
  try {
    // Prefer using mainApi which is already configured with axios
    const res = await mainApi.getAllCategories();
    categories.value = res.data || [];
  } catch (e) {
    console.error('Error fetching categories', e);
  }
}

async function fetchMaterials() {
  try {
    const res = await mainApi.getAllMaterials();
    materials.value = res.data || [];
  } catch (e) {
    console.error('Error fetching materials', e);
  }
}

onMounted(() => {
  fetchCategories();
  fetchMaterials();
});

const selectedFile = ref<File | null>(null);
const imageName = ref<string>('');
const imageDescription = ref<string>('');
const imageCategory = ref<string>('');
const imagePrice = ref<string>('');
const imageAmountAvailable = ref<string>('');
const imageMaterialIds = ref<string[]>([]);

const successMessage = ref<string>('');
const errorMessage = ref<string>('');
const uploading = ref<boolean>(false);

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
  uploading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const formData = new FormData();
    formData.append('imageFile', selectedFile.value);
    formData.append('imageName', imageName.value);
    formData.append('imageDescription', imageDescription.value);
    formData.append('categoryId', imageCategory.value);
    formData.append('price', imagePrice.value);
    formData.append('amountAvailable', imageAmountAvailable.value);
    formData.append('materialIds', JSON.stringify(imageMaterialIds.value));

    const resp = await mainApi.saveImage(formData);
    const newImage: IImage = resp.data;
    emit('uploaded', newImage);

    // show localized success message
    successMessage.value = `Зображення "${newImage.title ?? imageName.value}" успішно завантажено.`;
    // hide after a short timeout
    setTimeout(() => {
      successMessage.value = '';
    }, 4000);
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

<style scoped>
.image-upload-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

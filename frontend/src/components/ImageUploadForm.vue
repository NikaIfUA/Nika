<template>
  <v-card>
    <v-card-title>Створення товару</v-card-title>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-row>
          <v-col
            v-for="(src, index) in imagePreviews"
            :key="index"
            cols="6"
            sm="4"
            md="3"
          >
            <v-img
              :src="src"
              :class="{ 'selected-image': selectedPreviewIndex === index }"
              aspect-ratio="1"
              cover
              class="image-preview"
              @click="selectImage(index)"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate />
                </div>
              </template>
            </v-img>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="4">
        <div class="d-flex flex-column ga-4">
          <v-btn
            color="primary"
            variant="outlined"
            @click="triggerFileInput"
          >
            Додати фото
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            :disabled="selectedPreviewIndex === null"
            @click="deleteSelectedImage"
          >
            Видалити
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="itemData.name"
          label="Заголовок"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="itemData.price"
          label="Ціна"
          type="number"
          prefix="₴"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="itemData.description"
          label="Опис"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="itemData.categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Категорія"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="itemData.amountAvailable"
          label="Кількість в наявності"
          type="number"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="itemData.materialIds"
          :items="materials"
          item-title="name"
          item-value="id"
          label="Матеріали"
          multiple
          chips
          closable-chips
          variant="outlined"
        />
      </v-col>
    </v-row>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="d-none"
      @change="onFileChanged"
    />

    <v-card-actions class="pa-0 mt-6">
      <v-spacer />
      <v-btn variant="text" @click="$emit('cancel')">Відмінити</v-btn>
      <v-btn color="primary" variant="flat" @click="saveItem">Зберегти</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { IItem } from '@/interfaces';
import mainApi from '@/api/main.api';
import { API_URL } from '@/env';

const categories: Array<{ id: string; name: string }> = [];
const materials: Array<{ id: string; name: string }> = [];

const props = defineProps<{ apiUrl?: string }>();
const apiUrl = props.apiUrl ?? API_URL;

const emit = defineEmits<{
  (e: 'saved', payload: IItem): void;
  (e: 'cancel'): void;
}>();

const itemData = reactive({
  name: '',
  description: '',
  categoryId: null,
  price: null,
  amountAvailable: null,
  materialIds: [],
});

const selectedFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedPreviewIndex = ref<number | null>(null);

function triggerFileInput() {
  fileInput.value?.click();
}

const successMessage = ref<string>('');
const errorMessage = ref<string>('');
const uploading = ref<boolean>(false);

function onFileChanged(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  for (const file of files) {
    selectedFiles.value.push(file);
    imagePreviews.value.push(URL.createObjectURL(file));
  }

  target.value = '';
}

function selectImage(index: number) {
  if (selectedPreviewIndex.value === index) {
    selectedPreviewIndex.value = null;
  } else {
    selectedPreviewIndex.value = index;
  }
}

function deleteSelectedImage() {
  if (selectedPreviewIndex.value === null) return;
  
  const index = selectedPreviewIndex.value;
  URL.revokeObjectURL(imagePreviews.value[index]);

  selectedFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
  selectedPreviewIndex.value = null;
}

async function saveItem() {
  if (selectedFiles.value.length === 0) {
    alert('Будь ласка, додайте хоча б одне зображення!');
    return;
  }
  uploading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const formData = new FormData();

  if (selectedFiles.value.length > 0) {
    formData.append('imageFile', selectedFiles.value[0]);
  }
  
  formData.append('imageName', itemData.name);
  formData.append('imageDescription', itemData.description);
  if (itemData.categoryId) formData.append('categoryId', itemData.categoryId);
  if (itemData.price !== null) formData.append('price', String(itemData.price));
  if (itemData.amountAvailable !== null) formData.append('amountAvailable', String(itemData.amountAvailable));
  formData.append('materialIds', JSON.stringify(itemData.materialIds));

  try {
    const response = await mainApi.uploadItem(formData);
    const newItem: IItem = response.data;
    emit('saved', newItem);
  } catch (error) {
    console.error('Failed to upload item:', error);
    alert('Не вдалося зберегти товар. Спробуйте ще раз.');
  }
}
</script>

<style scoped>
.image-preview {
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s ease-in-out;
}

.image-preview:hover {
  border-color: #a0a0a0;
}

.selected-image {
  border-color: #1a73e8;
}
</style>

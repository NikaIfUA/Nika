<template>
  <v-card>
    <v-card-title>{{ isEditMode ? 'Редагування товару' : 'Створення товару' }}</v-card-title>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-row>
          <v-col
            v-for="(src, index) in imagePreviews"
            :key="index"
            cols="6" sm="4" md="3"
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
          v-model="itemData.title"
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
      <v-btn color="primary" variant="flat" @click="handleSubmit">{{ isEditMode ? 'Оновити' : 'Зберегти' }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { IItem, IImage } from '@/interfaces';
import mainApi from '@/api/main.api';
import { API_URL } from '@/env';
import { useProductDataStore } from '@/stores';

const productDataStore = useProductDataStore();
const { categories, materials } = storeToRefs(productDataStore);

const route = useRoute();
const itemId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => !!itemId.value && itemId.value !== 'new');
const props = defineProps<{ apiUrl?: string }>();
const apiUrl = props.apiUrl ?? API_URL;

const emit = defineEmits<{
  (e: 'saved', payload: IItem): void;
  (e: 'cancel'): void;
}>();

const itemData = reactive({
  title: '',
  description: '',
  categoryId: null as string | null,
  price: null as number | null,
  amountAvailable: null as number | null,
  materialIds: [] as string[],
});

const newFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const existingImages = ref<IImage[]>([]);
const imagesToDelete = ref<string[]>([]);

const fileInput = ref<HTMLInputElement | null>(null);
const selectedPreviewIndex = ref<number | null>(null);

function resetState() {
  Object.assign(itemData, {
    title: '',
    description: '',
    categoryId: null,
    price: null,
    amountAvailable: null,
    materialIds: [],
  });
  
  newFiles.value = [];
  imagePreviews.value = [];
  existingImages.value = [];
  imagesToDelete.value = [];
  
  selectedPreviewIndex.value = null;
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function fetchItemData() {
  if (!isEditMode.value || !itemId.value) return;
  resetState();

  try {
    const response = await mainApi.getItemById(itemId.value);
    const item = response.data;
    
    itemData.title = item.title;
    itemData.description = item.description || '';
    itemData.price = item.price ?? null;
    itemData.amountAvailable = item.amountAvailable ?? null;
    itemData.categoryId = item.category?.id || null; 
    itemData.materialIds = item.materials?.map(m => m.id) || []; 

    existingImages.value = item.images || [];
    imagePreviews.value = item.images.map(img => `${apiUrl}/items/${item.id}/image`);

  } catch (error) {
    console.error("Failed to fetch item data:", error);
  }
}

onMounted(async () => {
    await productDataStore.fetchInitialData();
    
    if (isEditMode.value) {
        await fetchItemData();
    }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    if (newId && newId !== 'new') {
      fetchItemData();
    } else {
      resetState();
    }
  }
});


function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChanged(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  for (const file of files) {
    newFiles.value.push(file);
    imagePreviews.value.push(URL.createObjectURL(file));
  }
  target.value = '';
}

function selectImage(index: number) {
  selectedPreviewIndex.value = (selectedPreviewIndex.value === index) ? null : index;
}

function deleteSelectedImage() {
  if (selectedPreviewIndex.value === null) return;
  
  const index = selectedPreviewIndex.value;
  const numExistingImages = existingImages.value.length;

  if (index < numExistingImages) {
    const imageToDelete = existingImages.value[index];
    if(imageToDelete?.id) {
      imagesToDelete.value.push(imageToDelete.id);
    }
    existingImages.value.splice(index, 1);
  } else {
    const newFileIndex = index - numExistingImages;
    newFiles.value.splice(newFileIndex, 1);
  }

  URL.revokeObjectURL(imagePreviews.value[index]);
  imagePreviews.value.splice(index, 1);
  selectedPreviewIndex.value = null;
}


async function handleSubmit() {
  if (imagePreviews.value.length === 0) {
    alert('Будь ласка, додайте хоча б одне зображення!');
    return;
  }

  const formData = new FormData();
  
  formData.append('title', itemData.title || '');
  formData.append('description', itemData.description || '');
  if (itemData.categoryId) formData.append('categoryId', itemData.categoryId);
  if (itemData.price !== null) formData.append('price', String(itemData.price));
  if (itemData.amountAvailable !== null) formData.append('amountAvailable', String(itemData.amountAvailable));
  formData.append('materialIds', JSON.stringify(itemData.materialIds));

  newFiles.value.forEach(file => {
    formData.append('newImages', file);
  });
  
  if (isEditMode.value) {
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete.value));
  }

  try {
    let response;
    if (isEditMode.value && itemId.value) {
      response = await mainApi.updateItem(itemId.value, formData);
    } else {
      response = await mainApi.createItem(formData);
    }
    emit('saved', response.data);
  } catch (error) {
    console.error('Failed to save item:', error);
    alert('Не вдалося зберегти товар. Спробуйте ще раз.');
  }
}
</script>

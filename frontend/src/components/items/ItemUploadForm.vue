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
          :disabled="itemData.isUnique"
          :readonly="itemData.isUnique"
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
          v-model="itemData.categoryIds"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Категорії"
          variant="outlined"
          multiple
          chips
          closable-chips
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="itemData.amountAvailable"
          label="Кількість в наявності"
          type="number"
          variant="outlined"
          :disabled="itemData.isUnique"
          :readonly="itemData.isUnique"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="itemData.isUnique"
          color="primary"
          label="Персоналізований товар"
          inset
          hide-details
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
      <v-btn variant="text" @click="router.push('/admin/items')">Відмінити</v-btn>
      <v-btn v-if="isEditMode" color="red-darken-4" variant="flat" @click="handleDelete">Видалити</v-btn>
      <v-btn color="primary" variant="flat" @click="handleSubmit">{{ isEditMode ? 'Оновити' : 'Зберегти' }}</v-btn>
    </v-card-actions>
  </v-card>

    <ConfirmDeleteDialog
    v-model="isDeleteDialogOpen"
    :item-name="itemData.title"
    item-type-name="товар"
    :loading="isDeleting"
    @confirm="confirmItemDelete"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { IImage } from '@/interfaces';
import mainApi from '@/api/main.api';
import { API_URL } from '@/env';
import { useCategoriesStore, useMaterialsStore, useItemsStore } from '@/stores';
import ConfirmDeleteDialog from '@/components/shared/ConfirmDeleteForm.vue';

const categoriesStore = useCategoriesStore();
const materialsStore = useMaterialsStore();
const itemsStore = useItemsStore();
const { categories } = storeToRefs(categoriesStore);
const { materials } = storeToRefs(materialsStore);

const route = useRoute();
const router = useRouter();
const itemId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => !!itemId.value && itemId.value !== 'new');

const itemData = reactive({
  title: '',
  description: '',
  categoryIds: [] as string[],
  price: null as number | null,
  amountAvailable: null as number | null,
  materialIds: [] as string[],
  isUnique: false,
});

const newFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const existingImages = ref<IImage[]>([]);

const fileInput = ref<HTMLInputElement | null>(null);
const selectedPreviewIndex = ref<number | null>(null);

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);

watch(() => itemData.isUnique, (isNowUnique) => {
  if (isNowUnique) {
    itemData.price = null;
    itemData.amountAvailable = null;
  }
});

function resetState() {
  Object.assign(itemData, {
    title: '',
    description: '',
    categoryIds: [],
    price: null,
    amountAvailable: null,
    materialIds: [],
    isUnique: false,
  });
  
  newFiles.value = [];
  imagePreviews.value = [];
  existingImages.value = [];
  
  selectedPreviewIndex.value = null;
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function fetchItemData() {
  if (!isEditMode.value || !itemId.value) return;
  resetState();

  try {
    const item = await mainApi.getItemById(itemId.value).then(res => res.data);
    
    itemData.title = item.title;
    itemData.description = item.description || '';
    itemData.price = item.price ?? null;
    itemData.amountAvailable = item.amountAvailable ?? null;
    itemData.categoryIds = item.categories?.map(c => c.id) || [];
    itemData.materialIds = item.materials?.map(m => m.id) || []; 
    itemData.isUnique = item.isUnique;

    existingImages.value = item.images || [];
    imagePreviews.value = item.images.map(img => `${API_URL}/items/${item.id}/images/${img.id}`);

  } catch (error) {
    console.error("Failed to fetch item data:", error);
    router.push('/admin/items');
  }
}

onMounted(async () => {  
  await categoriesStore.fetchCategories();
  await materialsStore.fetchMaterials();
    if (isEditMode.value) {
        await fetchItemData();
    }
});

watch(() => route.params.id, (newId) => {
  if (newId && newId !== 'new') {
    fetchItemData();
  } else {
    resetState();
  }
}, { immediate: true });


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
  if (itemData.price !== null) formData.append('price', String(itemData.price));
  if (itemData.amountAvailable !== null) formData.append('amountAvailable', String(itemData.amountAvailable));
  formData.append('categoryIds', JSON.stringify(itemData.categoryIds));
  formData.append('materialIds', JSON.stringify(itemData.materialIds));
  formData.append('isUnique', String(itemData.isUnique));

  newFiles.value.forEach(file => {
    formData.append('newImages', file);
  });
  
  if (isEditMode.value) {
    const existingImageIds = existingImages.value.map(img => img.id);
    formData.append('existingImageIds', JSON.stringify(existingImageIds));
  }

  try {
    if (isEditMode.value && itemId.value) {
      await itemsStore.updateItem(itemId.value, formData);
    } else {
      await itemsStore.createItem(formData);
    }
    await router.push('/admin');
  } catch (error) {
    console.error('Failed to save item:', error);
    alert('Не вдалося зберегти товар. Спробуйте ще раз.');
  }
}

function handleDelete() {
  if (!isEditMode.value || !itemId.value) return;
  isDeleteDialogOpen.value = true;
}

async function confirmItemDelete() {
  if (!isEditMode.value || !itemId.value) return;

  isDeleting.value = true;

  try {
    await itemsStore.deleteItem(itemId.value);
    await router.push('/admin/items');
  } catch (error) {
    console.error('Failed to delete item:', error);
    alert('Не вдалося видалити товар. Спробуйте ще раз.');
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
  }
}
</script>
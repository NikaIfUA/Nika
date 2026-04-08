<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn icon variant="text" to="/admin/categories" class="me-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon icon="mdi-tag-multiple"></v-icon> &nbsp;
        {{ isEditing ? `Редагування категорії: ${categoryName}` : 'Створення категорії' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-row>
              <v-col v-if="categoryImage" cols="12">
                <v-img :src="categoryImage" aspect-ratio="1" cover class="image-preview">
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
              <v-btn color="primary" variant="outlined" @click="triggerFileInput">
                Додати зображення
              </v-btn>
              <v-btn v-if="categoryImage" color="error" variant="outlined" @click="deleteImage">
                Видалити
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-row>
          <v-col cols="12">
            <v-text-field v-model="categoryName" label="Назва категорії" variant="outlined" />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="generalDescription"
              label="Опис"
              placeholder="Введіть опис категорії..."
              variant="outlined"
              rows="5"
            />
          </v-col>
        </v-row>

        <v-alert
          v-if="successMessage"
          type="success"
          closable
          class="mt-4"
          :text="successMessage"
          @update:modelValue="successMessage = ''"
        />
        <v-alert
          v-if="errorMessage"
          type="error"
          closable
          class="mt-4"
          :text="errorMessage"
          @update:modelValue="errorMessage = ''"
        />

        <v-card-actions class="pa-0 mt-6">
          <v-spacer />
          <v-btn @click="cancelEdit" color="primary" variant="text">
            Очистити
          </v-btn>
          <v-btn
            :loading="isSaving"
            :disabled="isSaving"
            @click="saveCategory"
            :color="isEditing ? 'success' : 'primary'"
            variant="flat"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
          >
            {{ isEditing ? 'Оновити' : 'Створити' }}
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>

    <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChanged" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { isAxiosError } from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useCategoriesStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ICategory } from '@/interfaces';

const router = useRouter();
const route = useRoute();
const categoriesStore = useCategoriesStore();

const categoryName = ref('');
const generalDescription = ref('');
const categoryImage = ref<string>('');
const newImageFile = ref<File | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (route.params.id) {
    const category = categoriesStore.categories.find(c => c.id === route.params.id);
    if (category) {
      loadEditingCategory(category);
    }
  }
});

function loadEditingCategory(category: ICategory) {
  categoryName.value = category.name;
  newImageFile.value = null;
  generalDescription.value = category.description || '';
  if (category.image?.id && category.id) {
    categoryImage.value = mainApi.getCategoryImageUrl(category.id, category.image.id);
  } else {
    categoryImage.value = '';
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChanged(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  const file = target.files[0];
  newImageFile.value = file;
  categoryImage.value = URL.createObjectURL(file);
  target.value = '';
}

function deleteImage() {
  if (categoryImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(categoryImage.value);
  }
  categoryImage.value = '';
  newImageFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function saveCategory() {
  if (!categoryName.value.trim()) {
    errorMessage.value = 'Назва категорії не може бути порожньою.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && route.params.id) {
      const formData = new FormData();
      formData.append('name', categoryName.value.trim());
      formData.append('description', generalDescription.value.trim());
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.updateCategory(route.params.id as string, formData);
      categoriesStore.updateCategory(response.data as ICategory);
      successMessage.value = 'Категорія успішно оновлена!';
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } else {
      const formData = new FormData();
      formData.append('name', categoryName.value.trim());
      formData.append('description', generalDescription.value.trim());
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.saveCategory(formData);
      categoriesStore.addCategory(response.data as ICategory);
      successMessage.value = 'Категорія успішно створена!';
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    }
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Помилка: ${message}`;
  } finally {
    isSaving.value = false;
  }
}

function cancelEdit() {
  router.push('/admin/categories');
}

defineExpose({
  loadEditingCategory
});
</script>

<style scoped>
.image-preview {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>

<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn icon variant="text" to="/admin/materials" class="me-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon icon="mdi-texture-box"></v-icon> &nbsp;
        {{ isEditing ? `Редагування матеріалу: ${materialName}` : 'Створення матеріалу' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-row>
              <v-col v-if="materialImage" cols="12">
                <v-img :src="materialImage" aspect-ratio="1" cover class="image-preview">
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
              <v-btn v-if="materialImage" color="error" variant="outlined" @click="deleteImage">
                Видалити
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-row>
          <v-col cols="12">
            <v-text-field v-model="materialName" label="Назва матеріалу" variant="outlined" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="parentId"
              :items="parentMaterialOptions"
              item-title="title"
              item-value="value"
              label="Батьківський матеріал"
              variant="outlined"
              clearable
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="generalDescription"
              label="Загальний опис"
              placeholder="Введіть загальний опис матеріалу..."
              variant="outlined"
              rows="3"
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
            @click="saveMaterial"
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
import { useMaterialsStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { IMaterial } from '@/interfaces';

const router = useRouter();
const route = useRoute();
const materialsStore = useMaterialsStore();

const materialName = ref('');
const generalDescription = ref('');
const parentId = ref<string | null>(null);
const materialImage = ref<string>('');
const newImageFile = ref<File | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!route.params.id);
const parentMaterialOptions = computed(() => {
  const currentId = route.params.id ? String(route.params.id) : null;
  return materialsStore.materials
    .filter((material) => material.id !== currentId)
    .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
    .map((material) => ({
      title: material.name,
      value: material.id,
    }));
});

onMounted(async () => {
  if (!materialsStore.materials.length) {
    await materialsStore.fetchMaterials();
  }

  if (route.params.id) {
    const material = materialsStore.materials.find(m => m.id === route.params.id);
    if (material) {
      loadEditingMaterial(material);
    }
  }
});

function loadEditingMaterial(material: IMaterial) {
  materialName.value = material.name;
  generalDescription.value = material.description || '';
  parentId.value = material.parentId ?? null;
  newImageFile.value = null;
  
  if (material.image?.id && material.id) {
    materialImage.value = mainApi.getMaterialImageUrl(material.id, material.image.id);
  } else {
    materialImage.value = '';
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
  materialImage.value = URL.createObjectURL(file);
  target.value = '';
}

function deleteImage() {
  if (materialImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(materialImage.value);
  }
  materialImage.value = '';
  newImageFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function saveMaterial() {
  if (!materialName.value.trim()) {
    errorMessage.value = 'Назва матеріалу не може бути порожньою.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && route.params.id) {
      const formData = new FormData();
      formData.append('name', materialName.value.trim());
      formData.append('description', generalDescription.value.trim());
      formData.append('parentId', parentId.value ?? '');
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.updateMaterial(route.params.id as string, formData);
      materialsStore.updateMaterial(response.data as IMaterial);
      successMessage.value = 'Матеріал успішно оновлено!';
      setTimeout(() => {
        router.push('/admin/materials');
      }, 1500);
    } else {
      const formData = new FormData();
      formData.append('name', materialName.value.trim());
      formData.append('description', generalDescription.value.trim());
      formData.append('parentId', parentId.value ?? '');
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.saveMaterial(formData);
      materialsStore.addMaterial(response.data as IMaterial);
      successMessage.value = 'Матеріал успішно створено!';
      setTimeout(() => {
        router.push('/admin/materials');
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
  router.push('/admin/materials');
}

defineExpose({
  loadEditingMaterial
});
</script>

<style scoped>
.image-preview {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>

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
            <v-textarea
              v-model="generalDescription"
              label="Загальний опис"
              placeholder="Введіть загальний опис матеріалу..."
              variant="outlined"
              rows="3"
            />
          </v-col>
          <v-col cols="12">
            <div class="mb-2 font-weight-bold">Деталі матеріалу (Секції):</div>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(section, index) in descriptionSections"
                :key="index"
              >
                <v-expansion-panel-title>
                  {{ section.title || `Секція ${index + 1}` }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-text-field
                    v-model="section.title"
                    label="Назва секції"
                    variant="outlined"
                    class="mb-3"
                  />
                  <v-textarea
                    v-model="section.content"
                    label="Вміст секції"
                    placeholder="Введіть текст..."
                    variant="outlined"
                    rows="4"
                  />
                  <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    @click="deleteSection(index)"
                    class="mt-2"
                  >
                    <v-icon>mdi-delete</v-icon> Видалити секцію
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-btn
              color="primary"
              variant="outlined"
              @click="addSection"
              class="mt-3"
            >
              <v-icon>mdi-plus</v-icon> Додати секцію
            </v-btn>
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
const materialDescription = ref('');
const materialImage = ref<string>('');
const newImageFile = ref<File | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const descriptionSections = ref<Array<{ title: string; content: string }>>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (route.params.id) {
    const material = materialsStore.materials.find(m => m.id === route.params.id);
    if (material) {
      loadEditingMaterial(material);
    }
  }
});

function loadEditingMaterial(material: IMaterial) {
  materialName.value = material.name;
  newImageFile.value = null;
  
  // Парсимо JSON опис
  if (material.description) {
    try {
      const parsed = JSON.parse(material.description);
      // Новий формат {general, sections}
      if (typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.sections)) {
        generalDescription.value = parsed.general || '';
        descriptionSections.value = parsed.sections;
      } else if (Array.isArray(parsed)) {
        // Старий формат - тільки секції
        generalDescription.value = '';
        descriptionSections.value = parsed;
      } else {
        // Звичайний текст
        generalDescription.value = material.description;
        descriptionSections.value = [];
      }
    } catch {
      // Не JSON - звичайний текст
      generalDescription.value = material.description;
      descriptionSections.value = [];
    }
  } else {
    generalDescription.value = '';
    descriptionSections.value = [];
  }
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

function addSection() {
  descriptionSections.value.push({ title: '', content: '' });
}

function deleteSection(index: number) {
  descriptionSections.value.splice(index, 1);
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
      // Серіалізуємо загальний опис та секції в JSON
      const descriptionData = {
        general: generalDescription.value.trim(),
        sections: descriptionSections.value
      };
      formData.append('description', JSON.stringify(descriptionData));
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
      // Серіалізуємо загальний опис та секції в JSON
      const descriptionData = {
        general: generalDescription.value.trim(),
        sections: descriptionSections.value
      };
      formData.append('description', JSON.stringify(descriptionData));
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

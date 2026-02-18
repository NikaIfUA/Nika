<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn icon variant="text" to="/admin/technologies" class="me-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon icon="mdi-cog"></v-icon> &nbsp;
        {{ isEditing ? `Редагування технології: ${technologyName}` : 'Створення технології' }}
      </v-card-title>

      <v-card-text>
      <v-row>
        <v-col cols="12" md="8">
          <v-row>
            <v-col
              v-if="technologyImage"
              cols="12"
            >
              <v-img
                :src="technologyImage"
                aspect-ratio="1"
                cover
                class="image-preview"
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
              Додати зображення
            </v-btn>
            <v-btn
              v-if="technologyImage"
              color="error"
              variant="outlined"
              @click="deleteImage"
            >
              Видалити
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="technologyName"
            label="Назва технології"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="generalDescription"
            label="Загальний опис"
            placeholder="Введіть загальний опис технології..."
            variant="outlined"
            rows="3"
          />
        </v-col>
        <v-col cols="12">
          <div class="mb-2 font-weight-bold">Деталі технології (Секції):</div>
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
      ></v-alert>
      <v-alert
        v-if="errorMessage"
        type="error"
        closable
        class="mt-4"
        :text="errorMessage"
        @update:modelValue="errorMessage = ''"
      ></v-alert>

      <v-card-actions class="pa-0 mt-6">
        <v-spacer />
        <v-btn
          @click="cancelEdit"
          color="primary"
          variant="text"
        >
          Очистити
        </v-btn>
        <v-btn
          :loading="isSaving"
          :disabled="isSaving"
          @click="saveTechnology"
          :color="isEditing ? 'success' : 'primary'"
          variant="flat"
          :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
        >
          {{ isEditing ? 'Оновити' : 'Створити' }}
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onFileChanged"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { isAxiosError } from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useTechnologiesStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ITechnology } from '@/interfaces';

const router = useRouter();
const route = useRoute();
const technologiesStore = useTechnologiesStore();

const technologyName = ref('');
const generalDescription = ref('');
const technologyDescription = ref('');
const technologyImage = ref<string>('');
const newImageFile = ref<File | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const descriptionSections = ref<Array<{ title: string; content: string }>>([]);

const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (route.params.id) {
    const technology = technologiesStore.technologies.find(t => t.id === route.params.id);
    if (technology) {
      loadEditingTechnology(technology);
    }
  }
});

function loadEditingTechnology(technology: ITechnology) {
  technologyName.value = technology.name;
  newImageFile.value = null;
  
  // Парсимо JSON опис
  if (technology.description) {
    try {
      const parsed = JSON.parse(technology.description);
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
        generalDescription.value = technology.description;
        descriptionSections.value = [];
      }
    } catch {
      // Не JSON - звичайний текст
      generalDescription.value = technology.description;
      descriptionSections.value = [];
    }
  } else {
    generalDescription.value = '';
    descriptionSections.value = [];
  }
  
  if (technology.image?.id && technology.id) {
    technologyImage.value = mainApi.getTechnologyImageUrl(technology.id, technology.image.id);
  } else {
    technologyImage.value = '';
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
  technologyImage.value = URL.createObjectURL(file);
  target.value = '';
}

function deleteImage() {
  if (technologyImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(technologyImage.value);
  }
  technologyImage.value = '';
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

async function saveTechnology() {
  if (!technologyName.value.trim()) {
    errorMessage.value = 'Назва технології не може бути порожньою.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && route.params.id) {
      const formData = new FormData();
      formData.append('name', technologyName.value.trim());
      // Серіалізуємо загальний опис та секції в JSON
      const descriptionData = {
        general: generalDescription.value.trim(),
        sections: descriptionSections.value
      };
      formData.append('description', JSON.stringify(descriptionData));
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.updateTechnology(route.params.id as string, formData);
      technologiesStore.updateTechnology(response.data as ITechnology);
      successMessage.value = 'Технологія успішно оновлена!';
      setTimeout(() => {
        router.push('/admin/technologies');
      }, 1500);
    } else {
      const formData = new FormData();
      formData.append('name', technologyName.value.trim());
      // Серіалізуємо загальний опис та секції в JSON
      const descriptionData = {
        general: generalDescription.value.trim(),
        sections: descriptionSections.value
      };
      formData.append('description', JSON.stringify(descriptionData));
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      const response = await mainApi.saveTechnology(formData);
      technologiesStore.addTechnology(response.data as ITechnology);
      successMessage.value = 'Технологія успішно створена!';
      setTimeout(() => {
        router.push('/admin/technologies');
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
  router.push('/admin/technologies');
}

// Expose functions for parent
defineExpose({
  loadEditingTechnology
});
</script>

<style scoped>
.image-preview {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>

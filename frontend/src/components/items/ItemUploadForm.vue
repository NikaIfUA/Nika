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
      <v-col cols="12">
        <v-switch
          v-model="itemData.isUnique"
          color="primary"
          label="Персоналізований товар"
          inset
          hide-details
        />
      </v-col>
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
      <v-col cols="12">
        <v-text-field
          v-model.number="itemData.amountAvailable"
          label="Кількість в наявності"
          type="number"
          variant="outlined"
          :disabled="itemData.isUnique"
          :readonly="itemData.isUnique"
        />
      </v-col>

      <v-col cols="12">
        <div class="mb-2 font-weight-medium">Категорії та підкатегорії:</div>
        <v-expansion-panels v-if="categories.length > 0">
          <v-expansion-panel
            v-for="category in categories"
            :key="category.id"
          >
            <v-expansion-panel-title>
              <v-checkbox
                :model-value="isCategorySelected(category.id)"
                @update:model-value="toggleCategory(category.id, !!$event)"
                @click.stop
                :label="category.name"
                hide-details
                density="compact"
              />
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="getItemSections(category).length > 0" class="pl-4">
                <div class="text-caption mb-2">Оберіть конкретні підкатегорії (необов'язково):</div>
                <v-checkbox
                  v-for="(section, index) in getItemSections(category)"
                  :key="index"
                  :model-value="isCategorySectionSelected(category.id, index)"
                  @update:model-value="toggleCategorySection(category.id, index, !!$event)"
                  :label="section.title || `Секція ${index + 1}`"
                  hide-details
                  density="compact"
                  class="mb-1"
                />
              </div>
              <div v-else class="text-caption text-grey pl-4">
                У цієї категорії немає секцій
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div v-else class="text-caption text-grey">
          Категорії не знайдено
        </div>
      </v-col>
      
      <v-col cols="12">
        <div class="mb-2 font-weight-medium">Матеріали та варіанти:</div>
        <v-expansion-panels v-if="materials.length > 0">
          <v-expansion-panel
            v-for="material in materials"
            :key="material.id"
          >
            <v-expansion-panel-title>
              <v-checkbox
                :model-value="isMaterialSelected(material.id)"
                @update:model-value="toggleMaterial(material.id, !!$event)"
                @click.stop
                :label="material.name"
                hide-details
                density="compact"
              />
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="getItemSections(material).length > 0" class="pl-4">
                <div class="text-caption mb-2">Оберіть конкретні варіанти (необов'язково):</div>
                <v-checkbox
                  v-for="(section, index) in getItemSections(material)"
                  :key="index"
                  :model-value="isMaterialSectionSelected(material.id, index)"
                  @update:model-value="toggleMaterialSection(material.id, index, !!$event)"
                  :label="section.title || `Секція ${index + 1}`"
                  hide-details
                  density="compact"
                  class="mb-1"
                />
              </div>
              <div v-else class="text-caption text-grey pl-4">
                У цього матеріалу немає секцій
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div v-else class="text-caption text-grey">
          Матеріали не знайдено
        </div>
      </v-col>
      
      <v-col cols="12">
        <div class="mb-2 font-weight-medium">Технології та їх класифікації:</div>
        <v-expansion-panels v-if="technologies.length > 0">
          <v-expansion-panel
            v-for="tech in technologies"
            :key="tech.id"
          >
            <v-expansion-panel-title>
              <v-checkbox
                :model-value="isTechnologySelected(tech.id)"
                @update:model-value="toggleTechnology(tech.id, !!$event)"
                @click.stop
                :label="tech.name"
                hide-details
                density="compact"
              />
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="getItemSections(tech).length > 0" class="pl-4">
                <div class="text-caption mb-2">Оберіть конкретні секції (необов'язково):</div>
                <v-checkbox
                  v-for="(section, index) in getItemSections(tech)"
                  :key="index"
                  :model-value="isSectionSelected(tech.id, index)"
                  @update:model-value="toggleSection(tech.id, index, !!$event)"
                  :label="section.title || `Секція ${index + 1}`"
                  hide-details
                  density="compact"
                  class="mb-1"
                />
              </div>
              <div v-else class="text-caption text-grey pl-4">
                У цієї технології немає секцій
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div v-else class="text-caption text-grey">
          Технології не знайдено
        </div>
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
import { useCategoriesStore, useMaterialsStore, useTechnologiesStore, useItemsStore } from '@/stores';
import ConfirmDeleteDialog from '@/components/shared/ConfirmDeleteForm.vue';

const categoriesStore = useCategoriesStore();
const materialsStore = useMaterialsStore();
const technologiesStore = useTechnologiesStore();
const itemsStore = useItemsStore();
const { categories } = storeToRefs(categoriesStore);
const { materials } = storeToRefs(materialsStore);
const { technologies } = storeToRefs(technologiesStore);

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
  technologyIds: [] as string[],
  isUnique: false,
});

// Нова структура для зберігання технологій з секціями
const selectedTechnologies = ref<Map<string, number[]>>(new Map());
const selectedCategories = ref<Map<string, number[]>>(new Map());
const selectedMaterials = ref<Map<string, number[]>>(new Map());
// Map: technologyId -> array of section indices (empty array = всі секції)

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
    technologyIds: [],
    isUnique: false,
  });
  
  newFiles.value = [];
  imagePreviews.value = [];
  existingImages.value = [];
  selectedTechnologies.value.clear();
  selectedCategories.value.clear();
  selectedMaterials.value.clear();
  
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
    itemData.technologyIds = item.technologies?.map(t => t.id) || [];
    itemData.isUnique = item.isUnique;

    selectedCategories.value.clear();
    if (item.categories && item.categories.length > 0) {
      item.categories.forEach(category => {
        if (category.selectedSections && Array.isArray(category.selectedSections)) {
          selectedCategories.value.set(category.id, category.selectedSections);
        } else {
          selectedCategories.value.set(category.id, []);
        }
      });
    }

    selectedMaterials.value.clear();
    if (item.materials && item.materials.length > 0) {
      item.materials.forEach(material => {
        if (material.selectedSections && Array.isArray(material.selectedSections)) {
          selectedMaterials.value.set(material.id, material.selectedSections);
        } else {
          selectedMaterials.value.set(material.id, []);
        }
      });
    }

    // Завантажуємо дані про технології з секціями
    if (item.technologies && item.technologies.length > 0) {
      item.technologies.forEach(tech => {
        // Перевіряємо чи є в технології інформація про обрані секції
        if (tech.selectedSections && Array.isArray(tech.selectedSections)) {
          selectedTechnologies.value.set(tech.id, tech.selectedSections);
        } else {
          // Якщо немає інформації про секції, вибираємо всі
          selectedTechnologies.value.set(tech.id, []);
        }
      });
    }

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
  await technologiesStore.fetchTechnologies();
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

// Функції для роботи з технологіями та секціями
function getItemSections(item: any): Array<{ title: string; content: string }> {
  if (!item.description) return [];
  try {
    const parsed = JSON.parse(item.description);
    // Новий формат {general, sections}
    if (typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.sections)) {
      return parsed.sections;
    }
    // Старий формат - просто масив секцій
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return [];
  }
  return [];
}

function isTechnologySelected(techId: string): boolean {
  return selectedTechnologies.value.has(techId);
}

function isSectionSelected(techId: string, sectionIndex: number): boolean {
  const sections = selectedTechnologies.value.get(techId);
  return sections ? sections.includes(sectionIndex) : false;
}

function toggleTechnology(techId: string, selected: boolean) {
  if (selected) {
    // Додаємо технологію з порожнім масивом секцій (всі секції)
    selectedTechnologies.value.set(techId, []);
  } else {
    // Видаляємо технологію
    selectedTechnologies.value.delete(techId);
  }
}

function toggleSection(techId: string, sectionIndex: number, selected: boolean) {
  if (!selectedTechnologies.value.has(techId)) {
    // Якщо технологія не вибрана, спочатку вибираємо її
    selectedTechnologies.value.set(techId, []);
  }
  
  const sections = selectedTechnologies.value.get(techId)!;
  
  if (selected) {
    // Додаємо секцію, якщо її ще немає
    if (!sections.includes(sectionIndex)) {
      sections.push(sectionIndex);
    }
  } else {
    // Видаляємо секцію
    const index = sections.indexOf(sectionIndex);
    if (index > -1) {
      sections.splice(index, 1);
    }
  }
}

function isCategorySelected(categoryId: string): boolean {
  return selectedCategories.value.has(categoryId);
}

function isCategorySectionSelected(categoryId: string, sectionIndex: number): boolean {
  const sections = selectedCategories.value.get(categoryId);
  return sections ? sections.includes(sectionIndex) : false;
}

function toggleCategory(categoryId: string, selected: boolean) {
  if (selected) {
    selectedCategories.value.set(categoryId, []);
  } else {
    selectedCategories.value.delete(categoryId);
  }
}

function toggleCategorySection(categoryId: string, sectionIndex: number, selected: boolean) {
  if (!selectedCategories.value.has(categoryId)) {
    selectedCategories.value.set(categoryId, []);
  }

  const sections = selectedCategories.value.get(categoryId)!;

  if (selected) {
    if (!sections.includes(sectionIndex)) {
      sections.push(sectionIndex);
    }
  } else {
    const index = sections.indexOf(sectionIndex);
    if (index > -1) {
      sections.splice(index, 1);
    }
  }
}

function isMaterialSelected(materialId: string): boolean {
  return selectedMaterials.value.has(materialId);
}

function isMaterialSectionSelected(materialId: string, sectionIndex: number): boolean {
  const sections = selectedMaterials.value.get(materialId);
  return sections ? sections.includes(sectionIndex) : false;
}

function toggleMaterial(materialId: string, selected: boolean) {
  if (selected) {
    selectedMaterials.value.set(materialId, []);
  } else {
    selectedMaterials.value.delete(materialId);
  }
}

function toggleMaterialSection(materialId: string, sectionIndex: number, selected: boolean) {
  if (!selectedMaterials.value.has(materialId)) {
    selectedMaterials.value.set(materialId, []);
  }

  const sections = selectedMaterials.value.get(materialId)!;

  if (selected) {
    if (!sections.includes(sectionIndex)) {
      sections.push(sectionIndex);
    }
  } else {
    const index = sections.indexOf(sectionIndex);
    if (index > -1) {
      sections.splice(index, 1);
    }
  }
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
  const categoryIds = Array.from(selectedCategories.value.keys());
  const materialIds = Array.from(selectedMaterials.value.keys());
  itemData.categoryIds = categoryIds;
  itemData.materialIds = materialIds;
  formData.append('categoryIds', JSON.stringify(categoryIds));
  formData.append('materialIds', JSON.stringify(materialIds));

  const categoriesData: Record<string, number[]> = {};
  selectedCategories.value.forEach((sections, id) => {
    categoriesData[id] = sections;
  });
  const materialsData: Record<string, number[]> = {};
  selectedMaterials.value.forEach((sections, id) => {
    materialsData[id] = sections;
  });
  formData.append('categoriesData', JSON.stringify(categoriesData));
  formData.append('materialsData', JSON.stringify(materialsData));
  
  // Конвертуємо Map в об'єкт для серіалізації
  const technologiesData: Record<string, number[]> = {};
  selectedTechnologies.value.forEach((sections, techId) => {
    technologiesData[techId] = sections;
  });
  formData.append('technologiesData', JSON.stringify(technologiesData));
  
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
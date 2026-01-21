<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-tag-multiple"></v-icon> &nbsp;
        {{ cardTitle }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="categoryName"
              :label="textFieldLabel"
              :placeholder="textFieldPlaceholder"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex ga-2">
            <v-btn
              :loading="isSaving"
              :disabled="isSaving"
              @click="saveCategory"
              :color="isEditing ? 'success' : 'primary'"
              block
              :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
            >
              {{ isEditing ? 'Оновити' : 'Створити' }}
            </v-btn>
            <v-btn
              @click="cancelEdit"
              color="primary"
              variant="text"
            >Очистити</v-btn>
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12">
            <v-textarea
              v-model="categoryDescription"
              label="Опис категорії"
              placeholder="Введіть опис категорії..."
              variant="outlined"
              density="compact"
              rows="4"
              hide-details
            ></v-textarea>
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
      </v-card-text>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="isLoading"
        loading-text="Loading... Please wait"
        no-data-text="No categories found."
        items-per-page="10"
        class="clickable-rows"
        @click:row="(_: any, { item }: { item: ICategory }) => handleRowClick(item)"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            variant="text"
            size="small"
            color="grey-darken-1"
            @click.stop="handleRowClick(item)"
          ><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn
            variant="text"
            size="small"
            color="red-lighten-1"
            @click.stop="promptDelete(item)"
          ><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmDeleteDialog
      v-model="isDeleteDialogOpen"
      :item-name="categoryToDelete?.name || ''"
      item-type-name="категорію"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue';
import { storeToRefs } from 'pinia';
import { isAxiosError } from 'axios';
import { useCategoriesStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ICategory } from '@/interfaces';
import ConfirmDeleteDialog from '../shared/ConfirmDeleteForm.vue';

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);
const isLoading = ref(true);

const fetchData = async () => {
  isLoading.value = true;
  await categoriesStore.fetchCategories();
  isLoading.value = false;
};

onMounted(fetchData);

onActivated(fetchData);

const headers = ref([
  { title: 'Назва', align: 'start' as const, key: 'name', sortable: true },
  { title: 'Дії', align: 'end' as const, key: 'actions', sortable: false },
]);

const categoryName = ref('');
const categoryDescription = ref('');
const editingCategory = ref<ICategory | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isEditing = computed(() => !!editingCategory.value);
const cardTitle = computed(() => isEditing.value ? `Редагування категорії: ${editingCategory.value?.name}` : 'Категорії');
const textFieldLabel = computed(() => isEditing.value ? 'Нова назва категорії' : 'Назва категорії');
const textFieldPlaceholder = computed(() => isEditing.value ? 'Введіть нову назву' : 'Введіть назву категорії');

// --- State for Delete ---
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const categoryToDelete = ref<ICategory | null>(null);

function handleRowClick(item: ICategory) {
  editingCategory.value = item;
  categoryName.value = item.name;
  categoryDescription.value = item.description || '';
  successMessage.value = '';
  errorMessage.value = '';
}

function cancelEdit() {
  editingCategory.value = null;
  categoryName.value = '';
  categoryDescription.value = '';
}

async function saveCategory() {
  if (!categoryName.value.trim()) {
    errorMessage.value = 'Category name cannot be empty.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && editingCategory.value) {
      const response = await mainApi.updateCategory(editingCategory.value.id, { 
        name: categoryName.value.trim(),
        description: categoryDescription.value.trim() || undefined
      });
      categoriesStore.updateCategory(response.data as ICategory);
      successMessage.value = 'Category updated successfully!';
    } else {
      const response = await mainApi.saveCategory({ 
        name: categoryName.value.trim(),
        description: categoryDescription.value.trim() || undefined
      });
      categoriesStore.addCategory(response.data as ICategory);
      successMessage.value = 'Category created successfully!';
    }
    cancelEdit();
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Error: ${message}`;
  } finally {
    isSaving.value = false;
  }
}

function promptDelete(item: ICategory) {
  categoryToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!categoryToDelete.value) return;

  isDeleting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    await mainApi.deleteCategory(categoryToDelete.value.id);
    categoriesStore.removeCategory(categoryToDelete.value.id);
    successMessage.value = `Category "${categoryToDelete.value.name}" deleted successfully.`;
  } catch (err) {
      const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Error: ${message}`;
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
    categoryToDelete.value = null;
  }
}
</script>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
</style>
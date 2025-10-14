<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-tag-multiple"></v-icon> &nbsp;
        Manage Categories
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="newCategoryName"
              label="New Category Name"
              placeholder="Enter category name"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              :loading="isSavingCategory"
              :disabled="isSavingCategory"
              @click="saveNewCategory"
              color="primary"
              block
              prepend-icon="mdi-plus-circle"
            >
              Create Category
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="categorySuccessMessage"
          type="success"
          closable
          class="mt-4"
          :text="categorySuccessMessage"
          @update:modelValue="categorySuccessMessage = ''"
        ></v-alert>
        <v-alert
          v-if="categoryErrorMessage"
          type="error"
          closable
          class="mt-4"
          :text="categoryErrorMessage"
          @update:modelValue="categoryErrorMessage = ''"
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
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="grey-darken-1" disabled></v-btn>
          <v-btn icon="mdi-delete" variant="text" size="small" color="red-lighten-1" disabled></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { isAxiosError } from 'axios';
import { useProductDataStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ICategory } from '@/interfaces';

const productDataStore = useProductDataStore();
const { categories } = storeToRefs(productDataStore);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  await productDataStore.fetchCategories();
  isLoading.value = false;
});

const headers = ref([
  { title: 'Name', align: 'start' as const, key: 'name', sortable: true },
  { title: 'Actions', align: 'end' as const, key: 'actions', sortable: false },
]);

const newCategoryName = ref('');
const isSavingCategory = ref(false);
const categorySuccessMessage = ref('');
const categoryErrorMessage = ref('');

async function saveNewCategory() {
  if (!newCategoryName.value.trim()) {
    categoryErrorMessage.value = 'Category name cannot be empty.';
    categorySuccessMessage.value = '';
    return;
  }

  isSavingCategory.value = true;
  categorySuccessMessage.value = '';
  categoryErrorMessage.value = '';

  try {
    const response = await mainApi.saveCategory({ name: newCategoryName.value.trim() });
    productDataStore.addCategory(response.data as ICategory);
    categorySuccessMessage.value = 'Category created successfully!';
    newCategoryName.value = '';
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    categoryErrorMessage.value = `Error: ${message}`;
  } finally {
    isSavingCategory.value = false;
  }
}
</script>

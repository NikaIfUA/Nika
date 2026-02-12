<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-tag-multiple"></v-icon> &nbsp;
          Список категорій
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus-circle"
          to="/admin/categories/add"
        >
          Додати категорію
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="isLoading"
        loading-text="Завантаження категорій..."
        no-data-text="Категорії не знайдено."
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
import { ref, onMounted, onActivated } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { isAxiosError } from 'axios';
import { useCategoriesStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ICategory } from '@/interfaces';
import ConfirmDeleteDialog from '../shared/ConfirmDeleteForm.vue';

const router = useRouter();
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

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const categoryToDelete = ref<ICategory | null>(null);

function handleRowClick(item: ICategory) {
  router.push(`/admin/categories/${item.id}`);
}

function promptDelete(item: ICategory) {
  categoryToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!categoryToDelete.value) return;

  isDeleting.value = true;

  try {
    await mainApi.deleteCategory(categoryToDelete.value.id);
    categoriesStore.removeCategory(categoryToDelete.value.id);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    console.error(`Помилка: ${message}`);
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
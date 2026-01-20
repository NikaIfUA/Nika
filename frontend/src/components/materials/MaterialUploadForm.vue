<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-texture-box"></v-icon> &nbsp;
          Список матеріалів
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus-circle"
          to="/admin/materials/add"
        >
          Додати матеріал
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="materials"
        :loading="isLoading"
        loading-text="Завантаження матеріалів..."
        no-data-text="Матеріали не знайдено."
        items-per-page="10"
        class="clickable-rows"
        @click:row="(_: any, { item }: { item: IMaterial }) => handleRowClick(item)"
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
      :item-name="materialToDelete?.name || ''"
      item-type-name="матеріал"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { isAxiosError } from 'axios';
import { useMaterialsStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { IMaterial } from '@/interfaces';
import ConfirmDeleteDialog from './ConfirmDeleteForm.vue';

const router = useRouter();
const materialsStore = useMaterialsStore();
const { materials } = storeToRefs(materialsStore);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  await materialsStore.fetchMaterials();
  isLoading.value = false;
});

const headers = ref([
  { title: 'Назва', align: 'start' as const, key: 'name', sortable: true },
  { title: 'Дії', align: 'end' as const, key: 'actions', sortable: false },
]);

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const materialToDelete = ref<IMaterial | null>(null);

function handleRowClick(item: IMaterial) {
  router.push(`/admin/materials/${item.id}`);
}

function promptDelete(item: IMaterial) {
  materialToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!materialToDelete.value) return;

  isDeleting.value = true;
  
  try {
    await mainApi.deleteMaterial(materialToDelete.value.id);
    materialsStore.removeMaterial(materialToDelete.value.id);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    console.error(`Помилка: ${message}`);
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
    materialToDelete.value = null;
  }
}
</script>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
</style>
<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-lightning-bolt"></v-icon> &nbsp;
          Список технологій
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus-circle"
          to="/admin/technologies/add"
        >
          Додати технологію
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="technologies"
        :loading="isLoading"
        loading-text="Завантаження технологій..."
        no-data-text="Технології не знайдено."
        items-per-page="10"
        class="clickable-rows"
        @click:row="(_: any, { item }: { item: ITechnology }) => handleRowClick(item)"
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
      :item-name="technologyToDelete?.name || ''"
      item-type-name="технологію"
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
import { useTechnologiesStore } from '@/stores';
import mainApi from '@/api/main.api';
import type { ITechnology } from '@/interfaces';
import ConfirmDeleteDialog from './ConfirmDeleteForm.vue';

const router = useRouter();
const technologiesStore = useTechnologiesStore();
const { technologies } = storeToRefs(technologiesStore);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  await technologiesStore.fetchTechnologies();
  isLoading.value = false;
});

const headers = ref([
  { title: 'Назва', align: 'start' as const, key: 'name', sortable: true },
  { title: 'Дії', align: 'end' as const, key: 'actions', sortable: false },
]);

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const technologyToDelete = ref<ITechnology | null>(null);

function handleRowClick(item: ITechnology) {
  router.push(`/admin/technologies/${item.id}`);
}

function promptDelete(item: ITechnology) {
  technologyToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!technologyToDelete.value) return;

  isDeleting.value = true;
  
  try {
    await mainApi.deleteTechnology(technologyToDelete.value.id);
    technologiesStore.removeTechnology(technologyToDelete.value.id);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    console.error(`Помилка: ${message}`);
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
    technologyToDelete.value = null;
  }
}
</script>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
</style>

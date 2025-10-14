<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-texture-box"></v-icon> &nbsp;
        Manage Materials
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="newMaterialName"
              label="New Material Name"
              placeholder="Enter material name"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              :loading="isSavingMaterial"
              :disabled="isSavingMaterial"
              @click="saveNewMaterial"
              color="primary"
              block
              prepend-icon="mdi-plus-circle"
            >
              Create Material
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="materialSuccessMessage"
          type="success"
          closable
          class="mt-4"
          :text="materialSuccessMessage"
          @update:modelValue="materialSuccessMessage = ''"
        ></v-alert>
        <v-alert
          v-if="materialErrorMessage"
          type="error"
          closable
          class="mt-4"
          :text="materialErrorMessage"
          @update:modelValue="materialErrorMessage = ''"
        ></v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="materials"
        :loading="isLoading"
        loading-text="Loading... Please wait"
        no-data-text="No materials found."
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
import type { IMaterial } from '@/interfaces';

const productDataStore = useProductDataStore();
const { materials } = storeToRefs(productDataStore);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  await productDataStore.fetchMaterials();
  isLoading.value = false;
});

const headers = ref([
  { title: 'Name', align: 'start' as const, key: 'name', sortable: true },
  { title: 'Actions', align: 'end' as const, key: 'actions', sortable: false },
]);

const newMaterialName = ref('');
const isSavingMaterial = ref(false);
const materialSuccessMessage = ref('');
const materialErrorMessage = ref('');

async function saveNewMaterial() {
  if (!newMaterialName.value.trim()) {
    materialErrorMessage.value = 'Material name cannot be empty.';
    materialSuccessMessage.value = '';
    return;
  }

  isSavingMaterial.value = true;
  materialSuccessMessage.value = '';
  materialErrorMessage.value = '';

  try {
    const response = await mainApi.saveMaterial({ name: newMaterialName.value.trim() });
    productDataStore.addMaterial(response.data as IMaterial);
    materialSuccessMessage.value = 'Material created successfully!';
    newMaterialName.value = '';
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    materialErrorMessage.value = `Error: ${message}`;
  } finally {
    isSavingMaterial.value = false;
  }
}
</script>

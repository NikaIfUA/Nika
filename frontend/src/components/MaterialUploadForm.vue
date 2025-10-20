<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-texture-box"></v-icon> &nbsp;
        {{ cardTitle }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="materialName"
              :label="textFieldLabel"
              :placeholder="textFieldPlaceholder"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3" class="d-flex ga-2">
            <v-btn
              :loading="isSaving"
              :disabled="isSaving"
              @click="saveMaterial"
              :color="isEditing ? 'success' : 'primary'"
              block
              :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </v-btn>
            <v-btn
              @click="cancelEdit"
              color="primary"
              variant="text"
            >Clear</v-btn>
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
        :items="materials"
        :loading="isLoading"
        loading-text="Loading... Please wait"
        no-data-text="No materials found."
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
          >Edit</v-btn>
          <v-btn
            variant="text"
            size="small"
            color="red-lighten-1"
            @click.stop="promptDelete(item)"
          >Delete</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="isDeleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete the material
          <strong>"{{ materialToDelete?.name }}"</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="isDeleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="confirmDelete" :loading="isDeleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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

const materialName = ref('');
const editingMaterial = ref<IMaterial | null>(null);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isEditing = computed(() => !!editingMaterial.value);
const cardTitle = computed(() => isEditing.value ? `Edit Material: ${editingMaterial.value?.name}` : 'Manage Materials');
const textFieldLabel = computed(() => isEditing.value ? 'New Material Name' : 'New Material Name');
const textFieldPlaceholder = computed(() => isEditing.value ? 'Enter the new name' : 'Enter material name');

// --- State for Delete ---
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const materialToDelete = ref<IMaterial | null>(null);

function handleRowClick(item: IMaterial) {
  editingMaterial.value = item;
  materialName.value = item.name;
  successMessage.value = '';
  errorMessage.value = '';
}

function cancelEdit() {
  editingMaterial.value = null;
  materialName.value = '';
}

async function saveMaterial() {
  if (!materialName.value.trim()) {
    errorMessage.value = 'Material name cannot be empty.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && editingMaterial.value) {
      const response = await mainApi.updateMaterial(editingMaterial.value.id, { name: materialName.value.trim() });
      productDataStore.updateMaterial(response.data as IMaterial);
      successMessage.value = 'Material updated successfully!';
    } else {
      const response = await mainApi.saveMaterial({ name: materialName.value.trim() });
      productDataStore.addMaterial(response.data as IMaterial);
      successMessage.value = 'Material created successfully!';
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

function promptDelete(item: IMaterial) {
  materialToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!materialToDelete.value) return;

  isDeleting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    await mainApi.deleteMaterial(materialToDelete.value.id);
    productDataStore.removeMaterial(materialToDelete.value.id);
    successMessage.value = `Material "${materialToDelete.value.name}" deleted successfully.`;
  } catch (err) {
      const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Error: ${message}`;
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
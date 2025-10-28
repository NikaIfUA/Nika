<template>
  <div class="shop-page">
    <div class="header">
      <h1>Крамниця</h1>
      <h3>Оберіть товари, які вам до вподоби</h3>
      
      <v-btn-toggle
        v-model="currentView"
        mandatory
        divided
        class="view-toggle"
      >
        <v-btn value="gallery">
          <v-icon>mdi-view-grid</v-icon>
          <span class="d-none d-sm-inline ml-2">Галерея</span>
        </v-btn>
        <v-btn value="table">
          <v-icon>mdi-view-list</v-icon>
          <span class="d-none d-sm-inline ml-2">Таблиця</span>
        </v-btn>
      </v-btn-toggle>
    </div>

    <div v-if="itemsLoading" class="status-message">
      <p>Завантаження товарів...</p>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="itemsError" class="status-message error">
      <p>Виникла помилка: {{ itemsError }}</p>
    </div>

    <template v-else-if="items.length > 0">
      <GalleryForm
        v-if="currentView === 'gallery'"
        :items="items"
        :image-urls="imageUrls"
        @item-click="openModal"
      />
      
      <ItemsDataTable
        v-else-if="currentView === 'table'"
        :items="items"
        :image-urls="imageUrls"
        :loading="itemsLoading"
        :error="itemsError"
        :is-admin="false"
        title="Каталог товарів"
        @item-click="openModal"
      />
    </template>
    
    <div v-else class="status-message">
        <p>Наразі товари відсутні.</p>
    </div>

    <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { IItem } from '../interfaces';
import { useProductDataStore } from '@/stores';
import GalleryForm from '@/components/GalleryForm.vue';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';
import ItemsDataTable from '@/components/ItemsDataTable.vue';

const currentView = ref<'gallery' | 'table'>('gallery');

const productStore = useProductDataStore();
const { shopItems: items, imageUrls, itemsLoading, itemsError } = storeToRefs(productStore);

const selectedItemId = ref<string | null>(null);

onMounted(() => {
  productStore.fetchItems();
});

function openModal(item: IItem) {
  selectedItemId.value = item.id;
}

function closeModal() {
  selectedItemId.value = null;
}
</script>

<style scoped>
.shop-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header h1,
.header h3 {
  text-align: center;
  margin: 0;
}

.view-toggle {
  margin-top: 1rem;
}

.status-message {
    text-align: center;
    margin-top: 2rem;
    color: #555;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.status-message.error {
    color: red;
}
</style>
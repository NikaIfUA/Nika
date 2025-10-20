<template>
  <div class="shop-page">
    <div class="header">
      <h1>Крамниця</h1>
      <h3>Оберіть товари, які вам до вподоби</h3>
    </div>

    <div v-if="itemsLoading" class="status-message">
      <p>Завантаження товарів...</p>
    </div>

    <div v-else-if="itemsError" class="status-message error">
      <p>Виникла помилка: {{ itemsError }}</p>
    </div>

    <GalleryForm
      v-else-if="items.length > 0"
      :items="items"
      :image-urls="imageUrls"
      @item-click="openModal"
    />
    
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

.header h1,
.header h3 {
  text-align: center;
}

.status-message {
    text-align: center;
    margin-top: 2rem;
    color: #555;
}

.status-message.error {
    color: red;
}
</style>
<template>
  <div class="shop-page">
  <div class="header">
    <h1>З увагою до деталей</h1>
    <h3>Майстерня реклами NIKA</h3>
  </div>

  <div v-if="itemsLoading">
    <p>Завантаження...</p>
  </div>

  <div v-else-if="itemsError">
    <p>Виникла помилка: {{ itemsError }}</p>
  </div>

  <GalleryForm
    v-else
    :items="items"
    @item-click="openModal"
  />
  </div>
  <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { IItem } from '../interfaces';
import { useItemsStore } from '@/stores';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';
import GalleryForm from '@/components/GalleryForm.vue';

const itemsStore = useItemsStore();
const { portfolioItems: items, imageUrls, itemsLoading, itemsError } = storeToRefs(itemsStore);

const selectedItemId = ref<string | null>(null);

onMounted(() => {
  itemsStore.fetchItems();
});

function openModal(item: IItem) {
  selectedItemId.value = item.id;
}

function closeModal() {
  selectedItemId.value = null;
}
</script>

<style scoped>
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

.shop-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}
</style>
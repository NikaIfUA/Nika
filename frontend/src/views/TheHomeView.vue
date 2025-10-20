<template>
  <div class="greetings">
    <h1>Welcome to the NIKA project!</h1>
    <h3>Here you can find information about the developers.</h3>
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
    :image-urls="imageUrls"
    @item-click="openModal"
  />

  <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { IItem } from '../interfaces';
import { useProductDataStore } from '@/stores';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';
import GalleryForm from '@/components/GalleryForm.vue';

const productStore = useProductDataStore();
const { portfolioItems: items, imageUrls, itemsLoading, itemsError } = storeToRefs(productStore);

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
/* Стилі, що не стосуються галереї, залишаються тут */
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
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

  <div v-else class="image-gallery">
    <div v-for="item in items" :key="item.id" class="image-card" @click="openModal(item)">
      <img :src="imageUrls[item.id]" :alt="item.title || 'NIKA project image'" />
      <p v-if="item.title">{{ item.title }}</p>
    </div>
  </div>

  <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia'; 
import type { IItem } from '../interfaces';
import { useProductDataStore } from '@/stores';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';

const productStore = useProductDataStore();

const { items, imageUrls, itemsLoading, itemsError } = storeToRefs(productStore);

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
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
}

.image-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.image-card:hover {
    transform: translateY(-5px);
}

.image-card img {
  width: 100%;
  height: 200px;
  object-fit: cover; 
}

.image-card p {
  padding: 0.75rem;
  margin: 0;
  font-weight: 500;
  color: #333;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

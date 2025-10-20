<template>
  <div class="image-gallery">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="image-card" 
      @click="onItemClick(item)"
    >
      <img :src="imageUrls[item.id]" :alt="item.title || 'NIKA project image'" />
      <p v-if="item.title">{{ item.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { IItem } from '../interfaces';

defineProps({
  items: {
    type: Array as PropType<IItem[]>,
    required: true,
  },
  imageUrls: {
    type: Object as PropType<Record<string, string>>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'item-click', item: IItem): void;
}>();

function onItemClick(item: IItem) {
  emit('item-click', item);
}
</script>

<style scoped>
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
</style>
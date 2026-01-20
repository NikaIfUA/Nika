<template>
  <div class="image-gallery">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="image-card" 
      @click="onItemClick(item)"
    >
      <img 
        v-if="thumbnails[item.id]" 
        :src="thumbnails[item.id]" 
        :alt="item.title || 'NIKA project image'" 
      />
      <div v-else class="loading-placeholder">
        <span>Завантаження...</span>
      </div>
      <p v-if="item.title">{{ item.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, type PropType } from 'vue';
import type { IItem } from '../interfaces';
import mainApi from '@/api/main.api';

const props = defineProps({
  items: {
    type: Array as PropType<IItem[]>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'item-click', item: IItem): void;
}>();

const thumbnails = ref<Record<string, string>>({});

async function generateThumbnail(item: IItem): Promise<void> {
  if (!item.coverImage || thumbnails.value[item.id]) return;

  try {
    // Завантажуємо cover image
    const response = await mainApi.getAllImages(item.id, item.coverImage);
    const blob = response.data;
    
    // Створюємо тимчасовий URL для оригінального зображення
    const originalUrl = URL.createObjectURL(blob);
    
    // Створюємо Image об'єкт для завантаження
    const img = new Image();
    img.src = originalUrl;
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Створюємо canvas для thumbnail
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }
          
          // Встановлюємо розміри thumbnail (макс. 400px по ширині)
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Малюємо зменшене зображення
          ctx.drawImage(img, 0, 0, width, height);
          
          // Конвертуємо canvas в blob і створюємо URL
          canvas.toBlob((thumbnailBlob) => {
            if (thumbnailBlob) {
              thumbnails.value[item.id] = URL.createObjectURL(thumbnailBlob);
            }
            // Очищаємо оригінальний URL
            URL.revokeObjectURL(originalUrl);
            resolve();
          }, 'image/jpeg', 0.8);
        } catch (err) {
          URL.revokeObjectURL(originalUrl);
          reject(err);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(originalUrl);
        reject(new Error('Failed to load image'));
      };
    });
  } catch (err) {
    console.error(`Error generating thumbnail for item ${item.id}:`, err);
  }
}

async function loadAllThumbnails() {
  const promises = props.items.map(item => generateThumbnail(item));
  await Promise.all(promises);
}

// Завантажуємо thumbnails при зміні items
watch(() => props.items, () => {
  loadAllThumbnails();
}, { immediate: true });

// Очищаємо URLs при unmount
onUnmounted(() => {
  Object.values(thumbnails.value).forEach(url => URL.revokeObjectURL(url));
});

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

.loading-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

.image-card p {
  padding: 0.75rem;
  margin: 0;
  font-weight: 500;
  color: #333;
}
</style>
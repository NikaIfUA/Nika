<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <button class="close" @click="close" aria-label="Close">×</button>
      <div v-if="item" class="content">
        <div class="image-wrap">
          <v-window
            v-if="itemImages.length"
            v-model="onboarding"
            show-arrows="hover"
            :style="{ height: currentImageHeight + 'px' }"
          >
            <v-window-item
              v-for="(imageData, index) in itemImages"
              :key="`card-${index}`"
            >
              <v-img
                :src="imageData.url"
                :alt="`${item.title} image ${index + 1}`"
                :height="imageData.height"
                :width="imageData.width"
                contain
              ></v-img>
            </v-window-item>

            <template v-slot:prev="{ props }">
              <button class="nav-arrow prev-arrow" @click="props.onClick" aria-label="Previous image">&lt;</button>
            </template>
            <template v-slot:next="{ props }">
              <button class="nav-arrow next-arrow" @click="props.onClick" aria-label="Next image">&gt;</button>
            </template>
            
          </v-window>

          <div v-else class="no-image-placeholder">
            Немає зображень
          </div>
        </div>

        <div class="meta">
          <h2>{{ item.title }}</h2>
          <p v-if="item.description">{{ item.description }}</p>
          <p v-if="item.categories?.length">Категорія: <strong>{{ item.categories.map(c => c.name).join(', ') }}</strong></p>
          <p v-if="item.price !== null && item.price !== 0">Ціна: <strong>{{ item.price }}</strong> грн</p>
          <p v-if="item.amountAvailable !== null && item.amountAvailable !== 0">Кількість: <strong>{{ item.amountAvailable }}</strong></p>
          <p v-if="item.materials?.length">Матеріали: <LinkableItemsList :items="item.materials" item-type="material" /></p>
          <p v-if="item.technologies?.length">Технології: <LinkableItemsList :items="item.technologies" item-type="technology" /></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import type { IItem } from '@/interfaces'; 
import mainApi from '@/api/main.api';
import LinkableItemsList from '@/components/shared/LinkableItemsList.vue';

const props = defineProps<{ itemId?: string }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const item = ref<IItem | undefined>();
const itemImages = ref<Array<{ url: string; width: number; height: number }>>([]);
const onboarding = ref(0);

// Обчислюємо висоту поточного зображення з максимумом 600px
const currentImageHeight = computed(() => {
  if (!itemImages.value.length) return 450;
  const currentImage = itemImages.value[onboarding.value];
  if (!currentImage) return 450;
  
  const maxHeight = 600;
  const maxWidth = 800;
  
  let displayHeight = currentImage.height;
  let displayWidth = currentImage.width;
  
  // Масштабуємо, якщо зображення занадто велике
  if (displayHeight > maxHeight || displayWidth > maxWidth) {
    const heightRatio = maxHeight / displayHeight;
    const widthRatio = maxWidth / displayWidth;
    const ratio = Math.min(heightRatio, widthRatio);
    
    displayHeight = Math.round(displayHeight * ratio);
    displayWidth = Math.round(displayWidth * ratio);
  }
  
  return displayHeight;
});

function close() {
  emit('close');
}

async function loadItemById(id: string) {
  try {
    // Очищаємо попередні URLs
    itemImages.value.forEach(img => URL.revokeObjectURL(img.url));
    itemImages.value = [];
    onboarding.value = 0;

    const itemResponse = await mainApi.getItemById(id);
    item.value = itemResponse.data;

    if (!item.value?.images?.length) {
      console.log('Item has no images.');
      return;
    }

    const imagePromises = item.value.images.map(image => 
      mainApi.getAllImages(item.value!.id, image.id)
    );
    const blobResponses = await Promise.all(imagePromises);

    // Створюємо об'єкти з URL та розмірами з БД
    const imageData = blobResponses.map((blobResponse, index) => {
      const blob = new Blob([blobResponse.data], { type: blobResponse.headers['content-type'] || 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const imageInfo = item.value!.images[index];
      
      return {
        url,
        width: imageInfo.resolution?.width || 800,
        height: imageInfo.resolution?.height || 600,
      };
    });
    
    itemImages.value = imageData;

  } catch (err) {
    console.error(`Failed to load item with id ${id}:`, err);
  }
}

watch(() => props.itemId, (newId) => {
  if (newId) loadItemById(newId);
});

onMounted(() => {
  if (props.itemId) loadItemById(props.itemId);
});

onUnmounted(() => {
  itemImages.value.forEach(img => URL.revokeObjectURL(img.url));
});

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 8px;
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  padding: 1rem;
}
.close {
  position: absolute;
  right: 8px;
  top: 8px;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  z-index: 10;
  color: #333;
}
.content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.image-wrap {
  width: 100%;
  max-width: 800px;
  position: relative;
  display: flex;
  justify-content: center;
}
.no-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 450px;
    width: 100%;
    background-color: #f0f0f0;
    color: #888;
    border-radius: 4px;
}
.meta {
  flex: 1;
  overflow: auto;
}
.meta h2 { margin: 0 0 0.5rem 0; }
.meta p { margin: 0.25rem 0; }

.nav-arrow {
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background-color: rgba(30, 30, 30, 0.4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding-bottom: 2px;
  transition: background-color 0.2s;
}
.nav-arrow:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
.prev-arrow {
  left: 10px;
}
.next-arrow {
  right: 10px;
}

@media (max-width: 700px) {
  .content { flex-direction: column; }
  .image-wrap { max-width: 100%; }
}
</style>

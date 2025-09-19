<template>
  <div class="greetings">
    <h1>Welcome to the NIKA project!</h1>
    <h3>Here you can find information about the developers.</h3>
  </div>

  <!-- temporary image gallery -->
  <div class="image-gallery">
      <div v-for="image in images" :key="image.id" class="image-card" @click="openImage(image)">
        <img :src="imageUrls[image.id]" :alt="image.title || 'NIKA project image'" />
        <p v-if="image.title">{{ image.title }}</p>
      </div>
  </div>

  <ImageDetailsModal v-if="selectedImage" :image="selectedImage" :imageUrl="imageUrls[selectedImage.id]" @close="selectedImage = null" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import type { IImage } from '../interfaces.ts';
import mainApi from '@/api/main.api.ts';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';

const images = ref<(IImage & { data: Record<string, number>; mimeType: string })[]>([]);
const selectedImage = ref<IImage | null>(null);
const imageUrls = reactive<Record<string, string>>({});

onMounted(async () => {
  try {
    const response = await mainApi.getAllImages();
    images.value = response.data as (IImage & { data: Record<string, number>; mimeType: string })[];

    for (const img of images.value) {
      const imageBytes = new Uint8Array(Object.values(img.data));
      const blob = new Blob([imageBytes], { type: img.mimeType });
      imageUrls[img.id] = URL.createObjectURL(blob);
    }

  } catch (error) {
    console.error("Error fetching images:", error);
  }
});

function openImage(img: IImage) {
  selectedImage.value = img;
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

.loading-message {
    text-align: center;
    margin-top: 2rem;
    color: #888;
}


@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

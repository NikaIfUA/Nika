<template>
  <div class="greetings">
    <h1>Welcome to the NIKA project!</h1>
    <h3>Here you can find information about the developers.</h3>
  </div>

  <!-- temporary image gallery -->
  <div class="image-gallery">
    <div v-for="item in images" :key="item.id" class="image-card">
      <img :src="item.images[0]?.url" :alt="item.title || 'NIKA project image'" />
      <p v-if="item.title">{{ item.title }}</p>
    </div>
      <div v-for="item in images" :key="item.id + '-gallery'" class="image-card" @click="openImage(item.images[0])">
        <img :src="imageUrls[item.id]" :alt="item.title || 'NIKA project image'" />
        <p v-if="item.title">{{ item.title }}</p>
      </div>
  </div>

  <ImageDetailsModal v-if="selectedImage" :image="selectedImage" :imageUrl="imageUrls[selectedImage.id]" @close="selectedImage = null" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import type { IImage, IItem } from '../interfaces.ts';
import mainApi from '@/api/main.api.ts';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';

const images = ref<IItem[]>([]);
const selectedImage = ref<IImage | null>(null);
const imageUrls = reactive<Record<string, string>>({});

onMounted(async () => {
  try {
    const response = await mainApi.getAllImages();
    images.value = (response.data as IImage[]).map((img) => ({
      id: img.id,
      title: img.description || 'Untitled Image',  // Required property
      description: img.description || null,
      category: null,
      price: null,
      amountAvailable: null,
      materials: null,
      images: [img],
      coverImage: img.id
    }));

    for (const img of images.value) {
      // Use the URL directly from the image object
      imageUrls[img.id] = img.images[0].url;
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

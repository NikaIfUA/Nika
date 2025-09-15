<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <button class="close" @click="close" aria-label="Close">×</button>
      <div class="content">
        <div class="image-wrap">
          <img :src="imageUrl || image?.url" :alt="image?.title || 'image'" />
        </div>
        <div class="meta">
          <h2 v-if="image?.title">{{ image?.title }}</h2>
          <p v-if="image?.description">{{ image?.description }}</p>
          <p v-if="image?.category">Категорія: <strong>{{ image?.category?.name }}</strong></p>
          <p v-if="image?.price !== undefined && image?.price !== null">Ціна: <strong>{{ image?.price }}</strong></p>
          <p v-if="image?.amountAvailable !== undefined && image?.amountAvailable !== null">Кількість: <strong>{{ image?.amountAvailable }}</strong></p>
          <p v-if="image?.materials && image?.materials.length">Матеріали: <strong>{{ image?.materials?.map(m => m.name).join(', ') }}</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { IImage } from '@/interfaces';
import mainApi from '@/api/main.api';

const props = defineProps<{ image?: IImage; imageUrl?: string; imageId?: string }>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const image = ref<IImage | undefined>(props.image);
const imageUrl = ref<string | undefined>(props.imageUrl);

function close() {
  emit('close');
}

async function loadById(id: string) {
  try {
    const allRes = await mainApi.getAllImages();
    const found = allRes.data?.find((i: IImage) => i.id === id);
    if (found) image.value = found;

    try {
      const blobRes = await mainApi.getImageById(id);
      const blob = new Blob([blobRes.data], { type: blobRes.headers['content-type'] || 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      imageUrl.value = url;
    } catch (err) {
      console.warn('Could not fetch image blob for id', id, err);
      imageUrl.value = undefined;
    }
  } catch (err) {
    console.error('Failed to load images metadata:', err);
  }
}

watch(() => props.imageId, (newId) => {
  if (newId) loadById(newId);
});

onMounted(() => {
  if (props.imageId) loadById(props.imageId);
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
  max-width: 900px;
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
}
.content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.image-wrap img {
  max-width: 480px;
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}
.meta {
  flex: 1;
  overflow: auto;
}
.meta h2 { margin: 0 0 0.5rem 0; }
.meta p { margin: 0.25rem 0; }

@media (max-width: 700px) {
  .content { flex-direction: column; }
  .image-wrap img { max-width: 100%; }
}
</style>

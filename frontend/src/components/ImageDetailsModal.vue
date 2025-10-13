<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <button class="close" @click="close" aria-label="Close">×</button>
      <div v-if="item" class="content">
        <div class="image-wrap">
          <img :src="coverImageUrl" :alt="item.title" />
        </div>
        <div class="meta">
          <h2>{{ item.title }}</h2>
          <p v-if="item.description">{{ item.description }}</p>
          <p v-if="item.category">Категорія: <strong>{{ item.category.name }}</strong></p>
          <p v-if="item.price !== null">Ціна: <strong>{{ item.price }}</strong></p>
          <p v-if="item.amountAvailable !== null">Кількість: <strong>{{ item.amountAvailable }}</strong></p>
          <p v-if="item.materials?.length">Матеріали: <strong>{{ item.materials.map(m => m.name).join(', ') }}</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { IItem } from '@/interfaces'; 
import mainApi from '@/api/main.api';

const props = defineProps<{ itemId?: string }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const item = ref<IItem | undefined>();
const coverImageUrl = ref<string | undefined>();

function close() {
  emit('close');
}

async function loadItemById(id: string) {
  try {
    const itemResponse = await mainApi.getItemById(id);
    item.value = itemResponse.data;

    if (!item.value) return;

    const blobResponse = await mainApi.getImage(id);
    const blob = new Blob([blobResponse.data], { type: blobResponse.headers['content-type'] || 'image/jpeg' });
    coverImageUrl.value = URL.createObjectURL(blob);
    
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

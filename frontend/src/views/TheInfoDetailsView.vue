<template>
  <div class="info-details-container">
    <div class="info-details-header">
      <router-link :to="{ name: 'info' }" class="back-button">← Назад</router-link>
      <h1>{{ item?.name || 'Завантаження...' }}</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Завантаження...</p>
    </div>

    <div v-else-if="item" class="info-details-content">
      <!-- Image Section -->
      <div v-if="item.image" class="image-section">
        <img
          :src="getImageUrl(item.image)"
          :alt="item.name"
          class="detail-image"
        />
      </div>

      <!-- Description Section -->
      <div class="detail-section">
        <h3>Опис</h3>
        <div class="detail-description">
          {{ item.description || 'Опис недоступний' }}
        </div>
      </div>

      <!-- Treeview Section -->
      <div v-if="itemType !== 'category'" class="treeview-section">
        <h2>{{ itemType === 'material' ? 'Матеріали' : 'Технології' }}</h2>
        <InfoTreeview :key="itemType" :type="itemType" :search-nodes="null" :active-slug="(item as any).slug" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import mainApi from '@/api/main.api';
  import type { IMaterial, ITechnology } from '@/interfaces';
  import { API_URL } from '@/env';
  import InfoTreeview from '@/components/treeviews/InfoTreeview.vue';

  const route = useRoute();
  const router = useRouter();
  const item = ref<(IMaterial | ITechnology) | null>(null);
  const itemType = ref<'material' | 'technology' | 'category'>('material');
  const isLoading = ref(false);

  const getImageUrl = (image: any): string => {
    if (!image || !image.id) return '';
    let type = itemType.value === 'material' ? 'materials' : itemType.value === 'technology' ? 'technologies' : 'categories';
    return `${API_URL}/${type}/${item.value?.id}/images/${image.id}`;
  };

  const loadData = async () => {
    isLoading.value = true;
    try {
      const slug = route.params.slug as string;
      const type = route.params.type as string;

      if (type === 'material') {
        itemType.value = 'material';
        const response = await mainApi.getAllMaterials();
        if (response.status === 200) {
          const foundItem = response.data?.find((m) => m.slug === slug);
          item.value = foundItem || null;
        }
      } else if (type === 'technology') {
        itemType.value = 'technology';
        const response = await mainApi.getAllTechnologies();
        if (response.status === 200) {
          const foundItem = response.data?.find((t) => t.slug === slug);
          item.value = foundItem || null;
        }
      } else if (type === 'category') {
        itemType.value = 'category';
        const response = await mainApi.getAllCategories();
        if (response.status === 200) {
          const foundItem = response.data?.find((c: any) => c.slug === slug);
          item.value = foundItem || null;
        }
      }

      if (!item.value) {
        console.warn('Item not found, redirecting...');
        router.push({ name: 'info' });
      }
    } catch (error) {
      console.error('Error loading item details:', error);
      router.push({ name: 'info' });
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadData();
  });

  watch(() => [route.params.type, route.params.slug], () => {
    loadData();
  });
</script>

<style scoped>
* {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
}

.info-details-container {
  padding: 2rem 0;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #ffffff;
}

.info-details-header {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  margin: 0 0 2rem 0;
}

.back-button {
  display: inline-block;
  margin-bottom: 1rem;
  color: #0645ad;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.back-button:hover {
  color: #3366cc;
  text-decoration: underline;
}

.info-details-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #202122;
  line-height: 1.3;
}

.info-details-content {
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.treeview-section {
  border-radius: 2px;
}

.treeview-section h2 {
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #a2a9b1;
  font-size: 1.2rem;
  font-weight: 600;
  color: #202122;
}

.detail-section {
  border-radius: 2px;
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.detail-section h2 {
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #a2a9b1;
  font-size: 1.3rem;
  font-weight: 600;
  color: #202122;
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #202122;
}

.detail-description {
  color: #202122;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.95rem;
}


.image-section {
  width: 100%;
  margin-bottom: 2rem;
  border-radius: 2px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 600px;
}

.detail-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
}

.info-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  color: #54595d;
  font-size: 0.95rem;
  display: flex;
  gap: 0.5rem;
}

.meta-item strong {
  color: #202122;
  min-width: 70px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  border-radius: 2px;
  margin: 0 1.5rem;
}

@media (max-width: 768px) {
  .info-details-container {
    padding: 1rem 0;
  }

  .info-details-header {
    padding: 0.5rem 1rem 1rem 1rem;
    margin: 0 0 1.5rem 0;
  }

  .info-details-header h1 {
    font-size: 1.5rem;
  }

  .info-details-content {
    padding: 0 1rem;
    gap: 1.5rem;
  }

  .detail-section {
    padding: 1rem;
  }

  .detail-description {
    font-size: 0.9rem;
  }

}

@media (max-width: 480px) {
  .info-details-header {
    padding: 0.5rem 0.75rem 1rem 0.75rem;
  }

  .info-details-header h1 {
    font-size: 1.3rem;
  }

  .info-details-content {
    padding: 0 0.75rem;
    gap: 1rem;
  }

  .detail-section {
    padding: 0.75rem;
  }

  .back-button {
    font-size: 0.9rem;
  }
}
</style>

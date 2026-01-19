<template>
  <div class="reference-container">
    <h1>Довідник матеріалів та технологій</h1>
    
    <div class="search-container">
      <BaseInput 
        v-model="searchQuery" 
        placeholder="Введіть назву матеріалу або технології..."
        @input="handleSearch"
      />
    </div>

    <div class="reference-content">
      <!-- Combined Grid -->
      <div class="reference-section">
        <h2>Матеріали та технології</h2>
        <div v-if="allFilteredItems.length > 0" class="items-grid">
          <div 
            v-for="item in allFilteredItems" 
            :key="item.id"
            class="grid-item"
            @click="selectItem(item)"
          >
            <span class="item-link">{{ item.name }}</span>
            <div v-if="item.description" class="item-hint">
              {{ truncateText(item.description, 60) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Матеріали та технології не знайдені</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import mainApi from '@/api/main.api';
  import type { IMaterial, ITechnology } from '@/interfaces';
  import BaseInput from '@/components/BaseInput.vue';

  const router = useRouter();
  const searchQuery = ref('');
  const materials = ref<IMaterial[]>([]);
  const technologies = ref<ITechnology[]>([]);
  const isLoading = ref(false);

  const filteredMaterials = computed(() => {
    if (!searchQuery.value) {
      return [...materials.value].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }
    return materials.value
      .filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  });

  const filteredTechnologies = computed(() => {
    if (!searchQuery.value) {
      return [...technologies.value].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }
    return technologies.value
      .filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  });

  const allFilteredItems = computed(() => {
    const combined = [
      ...filteredMaterials.value.map(m => ({ ...m, type: 'material' as const })),
      ...filteredTechnologies.value.map(t => ({ ...t, type: 'technology' as const }))
    ];
    return combined.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  });

  const loadData = async () => {
    isLoading.value = true;
    try {
      const [materialsRes, technologiesRes] = await Promise.all([
        mainApi.getAllMaterials(),
        mainApi.getAllTechnologies(),
      ]);

      if (materialsRes.status === 200) {
        materials.value = materialsRes.data || [];
      }
      if (technologiesRes.status === 200) {
        technologies.value = technologiesRes.data || [];
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleSearch = () => {
    // Search is handled by computed properties
  };

  const truncateText = (text: string, length: number): string => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const selectItem = (item: any) => {
    router.push({
      name: 'infoDetails',
      params: {
        type: item.type,
        slug: item.slug
      }
    });
  };

  onMounted(() => {
    loadData();
  });
</script>

<style scoped>
* {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
}

.reference-container {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
}

h1 {
  border-bottom: 3px solid #a7d8de;
  padding: 0.5rem 1.5rem 1rem 1.5rem;
  margin: 0 0 2rem 0;
  font-size: 1.95rem;
  font-weight: 600;
  color: #202122;
  line-height: 1.3;
}

.search-container {
  margin: 0 1.5rem 2rem 1.5rem;
  display: flex;
  justify-content: center;
}

.search-container :deep(input) {
  width: 100%;
  max-width: 550px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #a2a9b1;
  border-radius: 2px;
  background-color: #ffffff;
  transition: all 0.2s;
  box-shadow: 0 0 0 0 transparent;
}

.search-container :deep(input:focus) {
  outline: none;
  border-color: #36c;
  box-shadow: inset 0 0 0 1px #36c;
}

.search-container :deep(input::placeholder) {
  color: #72777d;
}

.reference-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 1.5rem 2rem 1.5rem;
}

.reference-section {
  background-color: transparent;
  border: none;
}

.reference-section h2 {
  margin: 0 0 1rem 0;
  padding: 0;
  background-color: transparent;
  border-bottom: 1px solid #a2a9b1;
  color: #202122;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 0.5rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0;
}

.grid-item {
  padding: 0.75rem;
  cursor: pointer;
  border: 1px solid #eaecf0;
  border-radius: 2px;
  background-color: #f8f9fa;
  transition: all 0.15s ease;
}

.grid-item:hover {
  background-color: #ede7ff;
  border-color: #0645ad;
}

.item-link {
  font-weight: 600;
  color: #0645ad;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 0.3rem;
}

.item-link:hover {
  text-decoration: underline;
  color: #3366cc;
}

.item-hint {
  color: #72777d;
  font-size: 0.8rem;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  color: #72777d;
  padding: 2rem;
  font-style: italic;
  background-color: #f8f9fa;
  border: 1px solid #eaecf0;
  border-radius: 2px;
}

.item-preview {
  color: #54595d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.25rem;
}

.empty-message {
  text-align: center;
  color: #72777d;
  padding: 2rem 1.2rem;
  font-style: italic;
  border-bottom: 1px solid #eaecf0;
}

@media (max-width: 768px) {
  .reference-content {
    margin: 0 1rem 2rem 1rem;
    gap: 1.5rem;
  }

  .reference-container {
    padding: 1rem 0;
  }

  h1 {
    padding: 0.5rem 1rem 1rem 1rem;
    font-size: 1.6rem;
    margin: 0 0 1.5rem 0;
  }

  .search-container {
    margin: 0 1rem 2rem 1rem;
  }

  .search-container :deep(input) {
    max-width: 100%;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .modal-content {
    max-width: calc(100% - 2rem);
    padding: 1.5rem;
  }

  .modal-content h2 {
    font-size: 1.3rem;
  }

  .detail-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.4rem;
    padding: 0.5rem 0.75rem 0.75rem 0.75rem;
  }

  .reference-content {
    margin: 0 0.75rem 1.5rem 0.75rem;
    gap: 1rem;
  }

  .search-container {
    margin: 0 0.75rem 1.5rem 0.75rem;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .grid-item {
    padding: 0.5rem;
  }

  .item-link {
    font-size: 0.9rem;
  }

  .item-hint {
    font-size: 0.75rem;
  }

  .modal-content {
    padding: 1.25rem;
  }
}
</style>
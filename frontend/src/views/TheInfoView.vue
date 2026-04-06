<template>
  <div class="reference-container">
    <h1>Довідник матеріалів та технологій</h1>

    <div class="search-container">
      <BaseInput
        v-model="searchQuery"
        placeholder="Введіть назву матеріалу або технології..."
      />
    </div>

    <div class="reference-content">
      <div class="reference-section">
        <h2>Матеріали</h2>
        <InfoTreeview
          type="material"
          :search-nodes="searchQuery ? searchResults.materials : null"
        />
      </div>

      <div class="reference-section">
        <h2>Технології</h2>
        <InfoTreeview
          type="technology"
          :search-nodes="searchQuery ? searchResults.technologies : null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import mainApi from '@/api/main.api';
  import BaseInput from '@/components/base/BaseInput.vue';
  import InfoTreeview, { type IFlatNode } from '@/components/treeviews/InfoTreeview.vue';

  type IChildNode = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    hasChildren: boolean;
  };

  const searchQuery = ref('');
  const searchResults = ref<{ materials: IFlatNode[]; technologies: IFlatNode[] }>({ materials: [], technologies: [] });
  let searchDebounce: ReturnType<typeof setTimeout> | null = null;

  const performSearch = async (query: string) => {
    if (!query) {
      searchResults.value = { materials: [], technologies: [] };
      return;
    }
    try {
      const res = await mainApi.getInfoTree();
      const q = query.toLowerCase();
      if (res.status === 200) {
        const all = res.data;
        searchResults.value = {
          materials: (all.materials as IChildNode[])
            .filter((m) => m.name.toLowerCase().includes(q))
            .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
            .map((m) => ({ id: m.id, title: m.name, slug: m.slug, depth: 0, hasChildren: false })),
          technologies: (all.technologies as IChildNode[])
            .filter((t) => t.name.toLowerCase().includes(q))
            .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
            .map((t) => ({ id: t.id, title: t.name, slug: t.slug, depth: 0, hasChildren: false })),
        };
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  watch(searchQuery, (val) => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => performSearch(val), 250);
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
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

@media (max-width: 768px) {
  .reference-content {
    grid-template-columns: 1fr;
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
}
</style>
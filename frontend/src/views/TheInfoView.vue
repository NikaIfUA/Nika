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
        <div v-if="filteredMaterials.length > 0" class="treeview-box">
          <v-treeview
            :items="materialsTreeItems"
            item-title="title"
            item-value="id"
            item-children="children"
            open-all
            activatable
            class="info-treeview"
            @update:activated="onMaterialActivated"
          />
        </div>
        <div v-else class="empty-state">
          <p>Матеріали не знайдені</p>
        </div>
      </div>

      <div class="reference-section">
        <h2>Технології</h2>
        <div v-if="filteredTechnologies.length > 0" class="treeview-box">
          <v-treeview
            :items="technologiesTreeItems"
            item-title="title"
            item-value="id"
            item-children="children"
            open-all
            activatable
            class="info-treeview"
            @update:activated="onTechnologyActivated"
          />
        </div>
        <div v-else class="empty-state">
          <p>Технології не знайдені</p>
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
  import BaseInput from '@/components/base/BaseInput.vue';

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

  type ITreeNode = {
    id: string;
    title: string;
    children?: ITreeNode[];
  };

  type IHierarchicalEntity = {
    id: string;
    name: string;
    parentId?: string | null;
  };

  const buildHierarchicalTreeItems = <T extends IHierarchicalEntity>(
    entities: T[],
    prefix: 'material' | 'technology',
    rootTitle: string,
  ): ITreeNode[] => {
    const nodeMap = new Map<string, ITreeNode>();
    const roots: ITreeNode[] = [];

    entities.forEach((entity) => {
      nodeMap.set(String(entity.id), {
        id: `${prefix}-${String(entity.id)}`,
        title: entity.name,
        children: [],
      });
    });

    entities.forEach((entity) => {
      const currentNode = nodeMap.get(String(entity.id));
      if (!currentNode) {
        return;
      }

      const parentId = entity.parentId ? String(entity.parentId) : null;
      if (!parentId) {
        roots.push(currentNode);
        return;
      }

      const parentNode = nodeMap.get(parentId);
      if (!parentNode) {
        roots.push(currentNode);
        return;
      }

      parentNode.children = [...(parentNode.children ?? []), currentNode];
    });

    const sortNodes = (nodes: ITreeNode[]): ITreeNode[] => {
      return nodes
        .map((node) => ({
          ...node,
          children: node.children ? sortNodes(node.children) : [],
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'uk'));
    };

    return [
      {
        id: `${prefix}-root`,
        title: rootTitle,
        children: sortNodes(roots),
      },
    ];
  };

  const materialsTreeItems = computed<ITreeNode[]>(() =>
    buildHierarchicalTreeItems(
      filteredMaterials.value,
      'material',
      `Список матеріалів (${filteredMaterials.value.length})`,
    )
  );

  const technologiesTreeItems = computed<ITreeNode[]>(() =>
    buildHierarchicalTreeItems(
      filteredTechnologies.value,
      'technology',
      `Список технологій (${filteredTechnologies.value.length})`,
    )
  );

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

  const selectItem = (item: IMaterial | ITechnology, type: 'material' | 'technology') => {
    router.push({
      name: 'infoDetails',
      params: {
        type,
        slug: item.slug
      }
    });
  };

  const extractActivatedId = (value: unknown, prefix: string): string | null => {
    if (!Array.isArray(value)) {
      return null;
    }

    const selectedId = value.find((id) => typeof id === 'string' && id.startsWith(prefix));
    return typeof selectedId === 'string' ? selectedId : null;
  };

  const onMaterialActivated = (value: unknown) => {
    const selectedId = extractActivatedId(value, 'material-');
    if (typeof selectedId !== 'string') {
      return;
    }

    const materialId = selectedId.replace('material-', '');
    const material = filteredMaterials.value.find((item) => String(item.id) === materialId);
    if (material) {
      selectItem(material, 'material');
    }
  };

  const onTechnologyActivated = (value: unknown) => {
    const selectedId = extractActivatedId(value, 'technology-');
    if (typeof selectedId !== 'string') {
      return;
    }

    const technologyId = selectedId.replace('technology-', '');
    const technology = filteredTechnologies.value.find((item) => String(item.id) === technologyId);
    if (technology) {
      selectItem(technology, 'technology');
    }
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

.treeview-box {
  background-color: #f8f9fa;
  border: 1px solid #eaecf0;
  border-radius: 2px;
  padding: 0.75rem;
}

.info-treeview :deep(.v-list-item-title) {
  font-size: 0.95rem;
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
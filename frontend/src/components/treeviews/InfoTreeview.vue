<template>
  <div v-if="isLoading" class="empty-state"><p>Завантаження...</p></div>
  <div v-else-if="flatNodes.length > 0" class="treeview-box">
    <v-virtual-scroll
      :items="flatNodes"
      :item-height="36"
      max-height="500"
    >
      <template #default="{ item }">
        <div
          class="tree-node"
          :class="{
            'tree-node--root': item.depth === 0,
            'tree-node--clickable': !!item.slug,
            'tree-node--loading': loadingIds.has(item.id),
            'tree-node--active': item.slug !== null && item.slug === props.activeSlug,
          }"
          :style="{ paddingLeft: `${item.depth * 20 + 8}px` }"
          @click="onNodeClick(item)"
        >
          <button
            v-if="item.hasChildren"
            class="tree-toggle"
            :disabled="loadingIds.has(item.id)"
            @click.stop="toggleNode(item)"
          >
            <v-icon v-if="loadingIds.has(item.id)" size="16" class="spin">mdi-loading</v-icon>
            <v-icon v-else size="16">
              {{ expandedIds.has(item.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
            </v-icon>
          </button>
          <span v-else class="tree-toggle-spacer" />
          <span class="tree-label">{{ item.title }}</span>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
  <div v-else class="empty-state">
    <p>{{ type === 'material' ? 'Матеріали не знайдені' : 'Технології не знайдені' }}</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import mainApi from '@/api/main.api';

  type IChildNode = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    hasChildren: boolean;
  };

  type ITreeNode = {
    id: string;
    name: string;
    slug: string | null;
    hasChildren: boolean;
    children: ITreeNode[] | null;
  };

  export type IFlatNode = {
    id: string;
    title: string;
    slug: string | null;
    depth: number;
    hasChildren: boolean;
  };

  const props = defineProps<{
    type: 'material' | 'technology';
    searchNodes: IFlatNode[] | null;
    activeSlug?: string | null;
  }>();

  const router = useRouter();
  const isLoading = ref(false);
  const tree = ref<ITreeNode[]>([]);
  const expandedIds = ref(new Set<string>());
  const loadingIds = ref(new Set<string>());

  const flattenTree = (nodes: ITreeNode[], depth: number): IFlatNode[] => {
    const result: IFlatNode[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, title: node.name, slug: node.slug, depth, hasChildren: node.hasChildren });
      if (expandedIds.value.has(node.id) && node.children) {
        result.push(...flattenTree(node.children, depth + 1));
      }
    }
    return result;
  };

  const flatNodes = computed<IFlatNode[]>(() => {
    if (props.searchNodes !== null) return props.searchNodes;
    return flattenTree(tree.value, 0);
  });

  const findNode = (nodes: ITreeNode[], id: string): ITreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleNode = async (flat: IFlatNode) => {
    const id = flat.id;
    const node = findNode(tree.value, id);
    if (!node) return;

    if (expandedIds.value.has(id)) {
      const next = new Set(expandedIds.value);
      next.delete(id);
      expandedIds.value = next;
      return;
    }

    if (node.children !== null) {
      const next = new Set(expandedIds.value);
      next.add(id);
      expandedIds.value = next;
      return;
    }

    const loading = new Set(loadingIds.value);
    loading.add(id);
    loadingIds.value = loading;

    try {
      const res = await mainApi.getInfoTreeChildren(props.type, node.id);
      node.children = res.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        hasChildren: c.hasChildren,
        children: null,
      }));
    } catch (e) {
      console.error('Failed to load children:', e);
    } finally {
      const l = new Set(loadingIds.value);
      l.delete(id);
      loadingIds.value = l;
    }

    const next = new Set(expandedIds.value);
    next.add(id);
    expandedIds.value = next;
  };

  const onNodeClick = (node: IFlatNode) => {
    if (!node.slug) return;
    router.push({ name: 'infoDetails', params: { type: props.type, slug: node.slug } });
  };

  const expandToActiveSlug = async () => {
    if (!props.activeSlug) return;
    try {
      const res = await mainApi.getInfoTree();
      const allNodes = (props.type === 'material'
        ? res.data.materials
        : res.data.technologies) as unknown as IChildNode[];

      const target = allNodes.find((n) => n.slug === props.activeSlug);
      if (!target) return;

      // Build ancestor chain from root down to direct parent
      const ancestorIds: string[] = [];
      let current: IChildNode = target;
      while (current.parentId) {
        ancestorIds.unshift(current.parentId);
        const parent = allNodes.find((n) => n.id === current.parentId);
        if (!parent) break;
        current = parent;
      }

      // Expand each ancestor top-down, lazy-loading children when needed
      for (const ancestorId of ancestorIds) {
        const treeNode = findNode(tree.value, ancestorId);
        if (!treeNode) continue;

        if (treeNode.children === null) {
          const childRes = await mainApi.getInfoTreeChildren(props.type, ancestorId);
          treeNode.children = childRes.data.items.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            hasChildren: c.hasChildren,
            children: null,
          }));
        }

        const next = new Set(expandedIds.value);
        next.add(ancestorId);
        expandedIds.value = next;
      }
    } catch (e) {
      console.error('Failed to expand to active slug:', e);
    }
  };

  onMounted(async () => {
    isLoading.value = true;
    try {
      const res = await mainApi.getInfoTreeChildren(props.type, null);
      tree.value = res.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        hasChildren: c.hasChildren,
        children: null,
      }));
    } catch (e) {
      console.error('Error loading tree:', e);
    } finally {
      isLoading.value = false;
    }
    await expandToActiveSlug();
  });

  watch(() => props.activeSlug, () => {
    expandToActiveSlug();
  });
</script>

<style scoped>
.treeview-box {
  background-color: #f8f9fa;
  border: 1px solid #eaecf0;
  border-radius: 2px;
  padding: 0.75rem;
}

.tree-node {
  display: flex;
  align-items: center;
  height: 36px;
  font-size: 0.95rem;
  border-radius: 2px;
  user-select: none;
  transition: background-color 0.12s;
}

.tree-node:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.tree-node--clickable {
  cursor: pointer;
}

.tree-node--clickable:hover {
  background-color: #e8f4f5;
  color: #1a6a70;
}

.tree-node--active {
  background-color: #d0edf0;
  color: #1a6a70;
  font-weight: 600;
}

.tree-node--active:hover {
  background-color: #b8e3e8;
}

.tree-node--loading {
  opacity: 0.7;
}

.tree-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #555;
  border-radius: 2px;
}

.tree-toggle:disabled {
  cursor: default;
}

.tree-toggle:not(:disabled):hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.tree-toggle-spacer {
  display: inline-block;
  width: 20px;
  flex-shrink: 0;
}

.tree-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 4px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.7s linear infinite;
}
</style>

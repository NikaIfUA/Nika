<template>
  <div class="linkable-items-list">
    <div v-if="items && items.length > 0" class="items-container">
      <template v-for="(item, index) in items" :key="item.id">
        <div class="item-wrapper">
          <router-link
            v-if="item.slug && item.slug !== '-' && item.slug.trim() !== ''"
            :to="{ name: 'infoDetails', params: { type: itemType, slug: item.slug } }"
            class="item-link"
          >
            <span class="item-name">{{ item.name }}</span>
          </router-link>
          <span v-else class="item-link item-no-link">
            <span class="item-name">{{ item.name }}</span>
          </span>

          <span v-if="index < items.length - 1" class="separator">, </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { ICategory, IMaterial, ITechnology } from '@/interfaces';

interface Props {
  items?: ICategory[] | IMaterial[] | ITechnology[];
  itemType: 'material' | 'technology' | 'category';
}

const props = withDefaults(defineProps<Props>(), {});

const itemsWithoutSlug = computed(() => {
  return props.items?.filter(item => !item.slug || item.slug === '-' || item.slug.trim() === '') || [];
});

onMounted(() => {
  if (itemsWithoutSlug.value.length > 0) {
    const label = props.itemType === 'material'
      ? 'Матеріали'
      : props.itemType === 'category'
        ? 'Категорії'
        : 'Технології';
    console.warn(
      `[⚠️  LinkableItemsList] ${label} без slug:`,
      itemsWithoutSlug.value
    );
  }
  
  // Логування всіх елементів для діагностики
  console.log(
    `[ℹ️ LinkableItemsList] Всі ${props.itemType}:`,
    props.items
  );
});
</script>

<style scoped>
.linkable-items-list {
  display: inline-block;
}

.items-container {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0;
}

.item-link {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
  padding: 0 2px;
}

.item-link:hover:not(.item-no-link) {
  color: #1565c0;
  text-decoration: underline;
}

.item-no-link {
  color: #666;
  cursor: default;
}

.item-name {
  display: inline;
}

.separator {
  margin: 0 4px;
  color: inherit;
}

.item-wrapper {
  display: inline;
}
</style>

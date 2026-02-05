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
          
          <!-- Секції технології -->
          <span v-if="itemType === 'technology' && hasSections(item)" class="sections-list">
            (<template v-for="(sectionIndex, i) in getSelectedSections(item)" :key="sectionIndex">
              <router-link
                :to="{
                  name: 'infoDetails',
                  params: { type: itemType, slug: item.slug },
                  hash: `#section-${getSectionId(item, sectionIndex)}`
                }"
                class="section-link"
              >
                {{ getSectionTitle(item, sectionIndex) }}
              </router-link>
              <span v-if="i < getSelectedSections(item).length - 1">, </span>
            </template>)
          </span>
          
          <span v-if="index < items.length - 1" class="separator">, </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { IMaterial, ITechnology } from '@/interfaces';

interface Props {
  items?: IMaterial[] | ITechnology[];
  itemType: 'material' | 'technology';
}

const props = withDefaults(defineProps<Props>(), {});

const itemsWithoutSlug = computed(() => {
  return props.items?.filter(item => !item.slug || item.slug === '-' || item.slug.trim() === '') || [];
});

// Функції для роботи з секціями технологій
function hasSections(item: any): boolean {
  return item.selectedSections && item.selectedSections.length > 0;
}

function getSelectedSections(item: any): number[] {
  return item.selectedSections || [];
}

function getSectionTitle(item: any, sectionIndex: number): string {
  if (!item.description) return `Секція ${sectionIndex + 1}`;
  try {
    const parsed = JSON.parse(item.description);
    if (typeof parsed === 'object' && Array.isArray(parsed.sections)) {
      const section = parsed.sections[sectionIndex];
      return section?.title || `Секція ${sectionIndex + 1}`;
    }
  } catch {
    return `Секція ${sectionIndex + 1}`;
  }
  return `Секція ${sectionIndex + 1}`;
}

function getSectionId(item: any, sectionIndex: number): string {
  const title = getSectionTitle(item, sectionIndex);
  if (title && !title.startsWith('Секція')) {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  return `section-${sectionIndex}`;
}

onMounted(() => {
  if (itemsWithoutSlug.value.length > 0) {
    console.warn(
      `[⚠️  LinkableItemsList] ${props.itemType === 'material' ? 'Матеріали' : 'Технології'} без slug:`,
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

.sections-list {
  display: inline;
  margin-left: 4px;
  font-size: 0.9em;
}

.section-link {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s ease;
  opacity: 0.8;
}

.section-link:hover {
  color: #1565c0;
  text-decoration: underline;
  opacity: 1;
}
</style>

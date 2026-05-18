<template>
  <v-card class="quick-links-section" variant="flat">
    <v-card-title class="text-h6 section-title">Каталог товарів</v-card-title>
    <v-card-text>
      <div v-if="categories.length" class="link-group">
        <h4>За категоріями</h4>
        <div class="chips-container">
          <v-btn
            v-for="cat in categories"
            :key="cat.id"
            :to="{ name: 'shop', query: { category: cat.id } }"
            variant="flat"
            color="primary"
            class="link-button"
          >
            {{ cat.name }}
          </v-btn>
        </div>
      </div>

      <div v-if="materials.length" class="link-group">
        <h4>За матеріалами</h4>
        <div class="chips-container">
          <v-btn
            v-for="mat in materials"
            :key="mat.id"
            :to="{ name: 'shop', query: { material: mat.id } }"
            variant="flat"
            color="secondary"
            class="link-button"
          >
            {{ mat.name }}
          </v-btn>
        </div>
      </div>

      <div v-if="technologies.length" class="link-group">
        <h4>За технологіями</h4>
        <div class="chips-container">
          <v-btn
            v-for="tech in technologies"
            :key="tech.id"
            :to="{ name: 'shop', query: { technology: tech.id } }"
            variant="flat"
            color="info"
            class="link-button"
          >
            {{ tech.name }}
          </v-btn>
        </div>
      </div>

      <p v-if="!categories.length && !materials.length && !technologies.length" class="text-grey">
        Дані завантажуються...
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoriesStore, useMaterialsStore, useTechnologiesStore } from '@/stores';

const categoriesStore = useCategoriesStore();
const materialsStore = useMaterialsStore();
const technologiesStore = useTechnologiesStore();

const { categories } = storeToRefs(categoriesStore);
const { materials } = storeToRefs(materialsStore);
const { technologies } = storeToRefs(technologiesStore);

onMounted(() => {
  categoriesStore.fetchCategories();
  materialsStore.fetchMaterials();
  technologiesStore.fetchTechnologies();
});
</script>

<style scoped>
.quick-links-section {
  margin-top: 1.5rem;
  border: none !important;
  box-shadow: none !important;
}

.section-title {
  text-align: center;
  justify-content: center;
}

.link-group {
  margin-bottom: 1.25rem;
  text-align: center;
}

.link-group h4 {
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.link-button {
  cursor: pointer;
  min-width: 140px;
  width: 140px;
  min-height: 108px;
  height: auto;
  border-radius: 14px;
  text-transform: none;
  padding: 10px;
}

.link-button :deep(.v-btn__content) {
  white-space: normal;
  text-align: center;
  line-height: 1.2;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>

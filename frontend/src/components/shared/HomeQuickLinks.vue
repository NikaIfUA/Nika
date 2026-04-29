<template>
  <v-card class="quick-links-section" variant="outlined">
    <v-card-title class="text-h6">Каталог товарів</v-card-title>
    <v-card-text>
      <div v-if="categories.length" class="link-group">
        <h4>За категоріями</h4>
        <div class="chips-container">
          <v-chip
            v-for="cat in categories"
            :key="cat.id"
            :to="{ name: 'shop', query: { category: cat.id } }"
            variant="outlined"
            color="primary"
            class="link-chip"
          >
            {{ cat.name }}
          </v-chip>
        </div>
      </div>

      <div v-if="materials.length" class="link-group">
        <h4>За матеріалами</h4>
        <div class="chips-container">
          <v-chip
            v-for="mat in materials"
            :key="mat.id"
            :to="{ name: 'shop', query: { material: mat.id } }"
            variant="outlined"
            color="secondary"
            class="link-chip"
          >
            {{ mat.name }}
          </v-chip>
        </div>
      </div>

      <div v-if="technologies.length" class="link-group">
        <h4>За технологіями</h4>
        <div class="chips-container">
          <v-chip
            v-for="tech in technologies"
            :key="tech.id"
            :to="{ name: 'shop', query: { technology: tech.id } }"
            variant="outlined"
            color="info"
            class="link-chip"
          >
            {{ tech.name }}
          </v-chip>
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
}

.link-group {
  margin-bottom: 1rem;
}

.link-group h4 {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.link-chip {
  cursor: pointer;
}
</style>

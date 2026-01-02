<template>
  <!-- Main Content -->
  <div class="shop-page" :class="{ 'sidebar-open': showFilters }">
    <div class="header">
      <h1>Крамниця</h1>
      <h3>Оберіть товари, які вам до вподоби</h3>
      
      <div class="controls">
        <v-btn-toggle
          v-model="currentView"
          mandatory
          divided
          class="view-toggle"
        >
          <v-btn value="gallery">
            <v-icon>mdi-view-grid</v-icon>
            <span class="d-none d-sm-inline ml-2">Галерея</span>
          </v-btn>
          <v-btn value="table">
            <v-icon>mdi-view-list</v-icon>
            <span class="d-none d-sm-inline ml-2">Таблиця</span>
          </v-btn>
        </v-btn-toggle>
      </div>

      <div class="sort-container">
        <button class="filter-open-btn" @click="showFilters = true">
          ☰ Фільтри
        </button>
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Сортування"
          density="compact"
          class="sort-select"
        />
      </div>
    </div>

    <div v-if="itemsLoading" class="status-message">
      <p>Завантаження товарів...</p>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="itemsError" class="status-message error">
      <p>Виникла помилка: {{ itemsError }}</p>
    </div>

    <template v-else-if="items.length > 0">
      <GalleryForm
        v-if="currentView === 'gallery'"
        :items="items"
        @item-click="openModal"
      />
      
      <ItemsDataTable
        v-else-if="currentView === 'table'"
        :items="items"
        :image-urls="imageUrls"
        :loading="itemsLoading"
        :error="itemsError"
        :is-admin="false"
        title="Каталог товарів"
        @item-click="openModal"
      />
    </template>
    
    <div v-else class="status-message">
      <p>Наразі товари відсутні.</p>
    </div>

    <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
  </div>

    <!-- Sidebar Фільтрів -->
  <div :class="['filters-sidebar', { open: showFilters }]">
    <button class="closebtn" @click="showFilters = false">&times;</button>
    
    <div class="filters-content">
      <h3>Фільтри</h3>

      <div class="filter-group">
        <label class="filter-label">Категорії</label>
        <div class="filter-options">
          <div v-for="cat in availableCategories" :key="cat.value" class="checkbox-item">
            <input 
              :id="`cat-${cat.value}`"
              type="checkbox" 
              :value="cat.value"
              v-model="selectedCategories"
            />
            <label :for="`cat-${cat.value}`">{{ cat.title }}</label>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Матеріали</label>
        <div class="filter-options">
          <div v-for="mat in availableMaterials" :key="mat.value" class="checkbox-item">
            <input 
              :id="`mat-${mat.value}`"
              type="checkbox" 
              :value="mat.value"
              v-model="selectedMaterials"
            />
            <label :for="`mat-${mat.value}`">{{ mat.title }}</label>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Ціна: {{ priceRange[0] }} - {{ priceRange[1] }} ₴</label>
        <input 
          type="range" 
          :value="priceRange[0]"
          :min="minPrice"
          :max="maxPrice"
          @input="e => priceRange[0] = Number((e.target as HTMLInputElement).value)"
          class="price-input"
        />
        <input 
          type="range" 
          :value="priceRange[1]"
          :min="minPrice"
          :max="maxPrice"
          @input="e => priceRange[1] = Number((e.target as HTMLInputElement).value)"
          class="price-input"
        />
      </div>

      <button v-if="hasActiveFilters" @click="resetFilters" class="reset-btn">
        Очистити фільтри
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { IItem } from '../interfaces';
import { useItemsStore } from '@/stores';
import GalleryForm from '@/components/GalleryForm.vue';
import ImageDetailsModal from '@/components/ImageDetailsModal.vue';
import ItemsDataTable from '@/components/ItemsDataTable.vue';
import {
  getPriceRange,
  filterItems,
  sortItems,
  getAvailableCategories,
  getAvailableMaterials,
  hasActiveFilters as checkActiveFilters,
  type FilterOptions,
} from '@/utils/filterAndSort';

const currentView = ref<'gallery' | 'table'>('gallery');
const showFilters = ref(false);
const sortBy = ref<string>('title-asc');
const selectedCategories = ref<string[]>([]);
const selectedMaterials = ref<string[]>([]);
const priceRange = ref<[number, number]>([0, 1000]);

const sortOptions = [
  { title: 'За назвою (А-Я)', value: 'title-asc' },
  { title: 'За назвою (Я-А)', value: 'title-desc' },
  { title: 'За ціною (зростання)', value: 'price-asc' },
  { title: 'За ціною (спадання)', value: 'price-desc' },
  { title: 'За датою (новіші)', value: 'date-desc' },
  { title: 'За датою (старіші)', value: 'date-asc' },
];

const itemsStore = useItemsStore();
const { shopItems, imageUrls, itemsLoading, itemsError } = storeToRefs(itemsStore);

const selectedItemId = ref<string | null>(null);

const availableCategories = computed(() => {
  return getAvailableCategories(shopItems.value);
});

const availableMaterials = computed(() => {
  return getAvailableMaterials(shopItems.value);
});

const priceRangeInfo = computed(() => {
  return getPriceRange(shopItems.value);
});

const minPrice = computed(() => priceRangeInfo.value.min);
const maxPrice = computed(() => priceRangeInfo.value.max);

onMounted(() => {
  itemsStore.fetchItems();
  priceRange.value = [minPrice.value, maxPrice.value];
});

const items = computed(() => {
  const filterOptions: FilterOptions = {
    selectedCategories: selectedCategories.value,
    selectedMaterials: selectedMaterials.value,
    priceRange: priceRange.value,
    sortBy: sortBy.value,
  };

  const filtered = filterItems(shopItems.value, filterOptions);
  return sortItems(filtered, sortBy.value);
});

const hasActiveFilters = computed(() => {
  return checkActiveFilters(
    {
      selectedCategories: selectedCategories.value,
      selectedMaterials: selectedMaterials.value,
      priceRange: priceRange.value,
      sortBy: sortBy.value,
    },
    priceRangeInfo.value
  );
});

function resetFilters() {
  selectedCategories.value = [];
  selectedMaterials.value = [];
  priceRange.value = [minPrice.value, maxPrice.value];
}

function openModal(item: IItem) {
  selectedItemId.value = item.id;
}

function closeModal() {
  selectedItemId.value = null;
}
</script>

<style scoped>
/* Sidebar Фільтрів */
.filters-sidebar {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  background-color: #f5f5f5;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 20px;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.filters-sidebar.open {
  width: 350px;
}

.filters-sidebar .closebtn {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 32px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filters-sidebar .closebtn:hover {
  color: #000;
}

.filters-content {
  padding: 20px;
  margin-top: 30px;
}

.filters-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-item label {
  cursor: pointer;
  font-size: 14px;
  color: #555;
  margin: 0;
}

.checkbox-item input[type="checkbox"]:hover + label {
  color: #333;
}

.price-input {
  width: 100%;
  margin-bottom: 8px;
  cursor: pointer;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.reset-btn:hover {
  background-color: #bebcc4;
}

/* Main Content */
.shop-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

.shop-page.sidebar-open {
  margin-left: 350px;
}

.filter-open-btn {
  padding: 8px 20px;
  margin-right: 20px;
  font-size: 16px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-open-btn:hover {
  background-color: #bebcc4;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header h1,
.header h3 {
  text-align: center;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.sort-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.view-toggle {
  flex-shrink: 0;
}

.sort-select {
  min-width: 250px;
  max-width: 400px;
}

.status-message {
  text-align: center;
  margin-top: 2rem;
  color: #555;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status-message.error {
  color: red;
}
</style>
<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <v-toolbar flat class="mb-2">
      <v-toolbar-title>{{ title }}</v-toolbar-title>

            <template v-if="isAdmin">
        <v-select
          v-model="selectedTypeFilter"
          :items="typeFilterOptions"
          label="Фільтр за типом"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 250px;"
          class="ml-4"
        ></v-select>
        
        <v-spacer></v-spacer>
        
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="emit('add-item-click')"
        >
          Додати товар
        </v-btn>
      </template>
    </v-toolbar>
    
    <v-data-table
      :headers="tableHeaders"
      :items="filteredItems"
      :loading="loading"
      @click:row="handleRowClick"
      item-value="id"
      class="elevation-1 table-row-pointer"
    >
                  <template v-slot:item.coverImage="{ item }">
        <v-img
          v-if="props.imageUrls[item.id]"
          :src="props.imageUrls[item.id]"
          :alt="item.title"
          width="80"
          height="80"
          cover
          class="rounded"
        ></v-img>
        <v-skeleton-loader
          v-else
          type="image"
          width="80"
          height="80"
        ></v-skeleton-loader>
      </template>

      <template v-slot:item.title="{ item }">
        <strong>{{ item.title }}</strong>
      </template>
      
      <template v-slot:item.isUnique="{ item }">
        <v-tooltip v-if="item.isUnique" location="top" text="Під замовлення">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" color="amber">mdi-star</v-icon>
          </template>
        </v-tooltip>
        <v-tooltip v-else location="top" text="Поштучно">
            <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="grey">mdi-star</v-icon>
            </template>
        </v-tooltip>
      </template>

      <template v-slot:item.categories="{ item }">
        <v-chip v-if="item.categories?.length"
          v-for="category in item.categories"
          :key="category.id"
          size="small" 
          color="primary"
          class="mr-1 mb-1"
        >
          {{ category.name }}
        </v-chip>
        <span v-else class="text-grey">—</span>
      </template>

      <template v-slot:item.description="{ item }">
        <span v-if="item.description" class="text-truncate">{{ formatDescription(item.description) }}</span>
        <span v-else class="text-grey">—</span>
      </template>

      <template v-slot:item.price="{ item }">
        <span v-if="item.price != null && item.price > 0">{{ formatPrice(item.price) }}</span>
        <span v-else class="text-grey">—</span>
      </template>

      <template v-slot:item.amountAvailable="{ item }">
      <v-chip 
        v-if="item.amountAvailable != null && item.amountAvailable > 0" 
        color="success"
        size="small"
      >
        {{ item.amountAvailable }}
      </v-chip>
      
      <span v-else class="text-grey">—</span>
    </template>

      <template v-slot:item.materials="{ item }">
        <div v-if="item.materials && item.materials.length > 0" class="py-1">
          <v-chip 
            v-for="material in item.materials" 
            :key="material.id" 
            size="small" 
            class="mr-1 mb-1"
          >
            {{ material.name }}
          </v-chip>
        </div>
        <span v-else class="text-grey">—</span>
      </template>
      
    </v-data-table>
  </v-container> 
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IItem } from '@/interfaces';

const props = defineProps<{
  items: IItem[];
  imageUrls: Record<string, string>;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'item-click', item: IItem): void;
  (e: 'add-item-click'): void;
}>();

const selectedTypeFilter = ref('all');

const typeFilterOptions = [
  { title: 'Всі товари', value: 'all' },
  { title: 'Під замовлення', value: 'unique' },
  { title: 'Поштучно', value: 'standard' }
];

const filteredItems = computed(() => {
  const sourceItems = props.items;
  const selected = selectedTypeFilter.value;
  
  if (selected === 'unique') {
    return sourceItems.filter(item => item.isUnique);
  }
  if (selected === 'standard') {
    return sourceItems.filter(item => !item.isUnique);
  }
  return sourceItems;
});

const allHeaders = [
  { title: 'Фото', align: 'center' as const, key: 'coverImage', sortable: false },
  { title: 'Назва', align: 'start' as const, key: 'title', sortable: true },
  { title: 'Тип', align: 'center' as const, key: 'isUnique', sortable: true },
  { title: 'Опис', align: 'start' as const, key: 'description', sortable: false, width: '30%' },
  { title: 'Категорії', align: 'center' as const, key: 'categories', sortable: true },
  { title: 'Ціна', align: 'end' as const, key: 'price', sortable: true },
  { title: 'Доступно', align: 'center' as const, key: 'amountAvailable', sortable: true },
  { title: 'Матеріали', align: 'start' as const, key: 'materials', sortable: false },
];

const tableHeaders = computed(() => {
  if (props.isAdmin) {
    return allHeaders;
  }
  return allHeaders.filter(h => h.key !== 'isUnique');
});


function handleRowClick(event: Event, { item }: { item: IItem }) {
  emit('item-click', item);
}

function formatDescription(description: string | null | undefined): string {
  if (!description) return '';

  // Обрізаємо довгий текст
  return description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
}
</script>

<style scoped>
.table-row-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
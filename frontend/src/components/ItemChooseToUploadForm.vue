<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <v-toolbar flat class="mb-2">
      <v-toolbar-title>Список товарів</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="navigateToCreatePage"
      >
        Додати товар
      </v-btn>
    </v-toolbar>
    
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      @click:row="handleRowClick"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.coverImage="{ item }">
        <v-img
          v-if="imageUrls[item.id]"
          :src="imageUrls[item.id]"
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

      <template v-slot:item.category="{ item }">
        <v-chip v-if="item.category" size="small" color="primary">
          {{ item.category.name }}
        </v-chip>
        <span v-else class="text-grey">—</span>
      </template>

      <template v-slot:item.price="{ item }">
        <span v-if="item.price != null">{{ formatPrice(item.price) }}</span>
        <span v-else class="text-grey">—</span>
      </template>

      <template v-slot:item.amountAvailable="{ item }">
        <v-chip 
          v-if="item.amountAvailable != null" 
          :color="item.amountAvailable > 0 ? 'success' : 'error'"
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

      <template v-slot:item.images="{ item }">
        <v-chip size="small">{{ item.images.length }} фото</v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import mainApi from '@/api/main.api'
  import type { IItem } from '@/interfaces'
  import router from '@/router'

  const headers = [
    { title: 'Фото', align: 'center' as const, key: 'coverImage', sortable: false },
    { title: 'Назва', align: 'start' as const, key: 'title', sortable: true },
    { title: 'Опис', align: 'start' as const, key: 'description', sortable: false, width: '30%' },
    { title: 'Категорія', align: 'center' as const, key: 'category', sortable: true },
    { title: 'Ціна', align: 'end' as const, key: 'price', sortable: true },
    { title: 'Доступно', align: 'center' as const, key: 'amountAvailable', sortable: true },
    { title: 'Матеріали', align: 'start' as const, key: 'materials', sortable: false },
  ]

  const items = ref<IItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const imageUrls = ref<Record<string, string>>({})

  onMounted(() => {
    fetchItems()
  })

  async function fetchItems() {
    loading.value = true;
    error.value = null;
    try {
      const response = await mainApi.getAllItems();
      items.value = response.data;
      
      await loadImages()
    } catch (err: any) {
      error.value = err.message || 'Помилка завантаження даних';
      console.error('Error fetching items:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadImages() {
    const imagePromises = items.value.map(async (item) => {
      try {
        const response = await mainApi.getImage(item.id);
        const blob = response.data;
        imageUrls.value[item.id] = URL.createObjectURL(blob);
      } catch (err) {
        console.error(`Error loading image for item ${item.id}:`, err);
      }
    });
    await Promise.all(imagePromises);
  }

function navigateToCreatePage() {
  router.replace('/admin/item/new');
}

function handleRowClick(event: Event, { item }: { item: IItem }) {
  router.replace(`/admin/item/${item.id}`);
}

  function formatPrice(value: number): string {
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
  }
</script>
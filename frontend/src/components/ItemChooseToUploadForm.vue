<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
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
        <div v-if="item.materials && item.materials.length > 0">
          <v-chip 
            v-for="material in item.materials" 
            :key="material.id" 
            size="small" 
            class="mr-1"
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

  const headers = [
    { title: 'Фото', align: 'center' as const, key: 'coverImage', sortable: false },
    { title: 'Назва', align: 'start' as const, key: 'title', sortable: true },
    { title: 'Опис', align: 'start' as const, key: 'description', sortable: false },
    { title: 'Категорія', align: 'center' as const, key: 'category', sortable: true },
    { title: 'Ціна', align: 'end' as const, key: 'price', sortable: true },
    { title: 'Доступно', align: 'center' as const, key: 'amountAvailable', sortable: true },
    { title: 'Матеріали', align: 'start' as const, key: 'materials', sortable: false },
    { title: 'Зображення', align: 'center' as const, key: 'images', sortable: false },
  ]

  const items = ref<IItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const imageUrls = ref<Record<string, string>>({})

  const fetchItems = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await mainApi.getAllItems()
      items.value = response.data
      
      // Завантажуємо зображення для кожного елемента
      await loadImages()
    } catch (err: any) {
      error.value = err.message || 'Помилка завантаження даних'
      console.error('Error fetching items:', err)
    } finally {
      loading.value = false
    }
  }

  const loadImages = async () => {
    for (const item of items.value) {
      try {
        const response = await mainApi.getImage(item.id)
        const blob = response.data
        imageUrls.value[item.id] = URL.createObjectURL(blob)
      } catch (err) {
        console.error(`Error loading image for item ${item.id}:`, err)
      }
    }
  }

  onMounted(() => {
    fetchItems()
  })

  function formatPrice(value: number): string {
    return `${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')} грн`
  }
</script>
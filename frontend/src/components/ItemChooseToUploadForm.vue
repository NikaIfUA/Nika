<template>
  <ItemsDataTable
    :items="items"
    :image-urls="imageUrls"
    :loading="loading"
    :error="error"
    :is-admin="true"
    title="Список товарів (Адмін)"
    @item-click="handleAdminRowClick"
    @add-item-click="navigateToCreatePage"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductDataStore } from '@/stores';
import type { IItem } from '@/interfaces';
import router from '@/router';
import ItemsDataTable from '@/components/ItemsDataTable.vue'; // Використовуємо наш новий компонент

const productDataStore = useProductDataStore();
// Тут ми беремо *всі* товари, а не тільки shopItems
const { items, imageUrls, itemsLoading: loading, itemsError: error } = storeToRefs(productDataStore);

onMounted(() => {
  productDataStore.fetchItems();
});

function navigateToCreatePage() {
  router.push('/admin/item/new');
}

function handleAdminRowClick(item: IItem) {
  router.push(`/admin/item/${item.id}`);
}
</script>
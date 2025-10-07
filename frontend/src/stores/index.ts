// src/stores/productData.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ICategory, IMaterial } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useProductDataStore = defineStore('productData', () => {
  const categories = ref<ICategory[]>([]);
  const materials = ref<IMaterial[]>([]);

  async function fetchCategories() {
    try {
      const res = await mainApi.getAllCategories()
      if (res.status === 200) {
        categories.value = res.data;
      }
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  }

  async function fetchMaterials() {
    try {
      const res = await mainApi.getAllMaterials();
      if (res.status === 200) {
        materials.value = res.data;
      }
    } catch (e) {
      console.error('Error fetching materials', e);
    }
  }

  async function fetchInitialData() {
    if (categories.value.length > 0 && materials.value.length > 0) {
      return
    }
    await Promise.all([
      fetchCategories(),
      fetchMaterials()
    ]);
  }

  return {
    categories,
    materials,
    fetchCategories,
    fetchMaterials,
    fetchInitialData,
  }
})
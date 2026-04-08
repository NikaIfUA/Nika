import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ICategory } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<ICategory[]>([])

  async function fetchCategories() {
    try {
      const res = await mainApi.getAllCategories()
      categories.value = res.data
    } catch (e) {
      console.error('Error fetching categories', e)
    }
  }

  function addCategory(newCategory: ICategory) {
    categories.value.push(newCategory)
  }

  function updateCategory(updatedCategory: ICategory) {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
  }

  function removeCategory(categoryId: string | number) {
    categories.value = categories.value.filter(c => c.id !== categoryId)
  }

  return {
    // State
    categories,
    // Actions
    fetchCategories,
    addCategory,
    updateCategory,
    removeCategory,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IItem } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useItemsStore = defineStore('items', () => {
  const items = ref<IItem[]>([])
  const imageUrls = ref<Record<string, string>>({})
  const itemsLoading = ref(false)
  const itemsError = ref<string | null>(null)

  // Computed properties
  const shopItems = computed(() => items.value.filter(item => !item.isUnique))
  const portfolioItems = computed(() => items.value.filter(item => item.isUnique))

  // Image handling functions
  async function loadImageForItem(item: IItem) {
    if (!item?.id || imageUrls.value[item.id]) return

    try {
      const response = await mainApi.getImage(item.id)
      const blob = response.data
      imageUrls.value[item.id] = URL.createObjectURL(blob)
    } catch (err) {
      console.error(`Error loading image for item ${item.id}:`, err)
    }
  }

  async function loadAllItemImages() {
    const promises = items.value.map(item => loadImageForItem(item))
    await Promise.all(promises)
  }

  function revokeItemImageURL(itemId: string) {
    if (imageUrls.value[itemId]) {
      URL.revokeObjectURL(imageUrls.value[itemId])
      delete imageUrls.value[itemId]
    }
  }

  // Items CRUD operations
  async function fetchItems() {
    if (items.value.length > 0 && !itemsError.value) return

    itemsLoading.value = true
    itemsError.value = null
    try {
      const response = await mainApi.getAllItems()
      items.value = response.data
      await loadAllItemImages()
    } catch (err: any) {
      itemsError.value = err.message || 'Помилка завантаження товарів'
      console.error('Error fetching items:', err)
    } finally {
      itemsLoading.value = false
    }
  }

  async function createItem(formData: FormData): Promise<IItem> {
    const response = await mainApi.createItem(formData)
    const newItem = response.data
    items.value.unshift(newItem)
    await loadImageForItem(newItem)
    return newItem
  }

  async function updateItem(itemId: string, formData: FormData): Promise<IItem> {
    const response = await mainApi.updateItem(itemId, formData)
    const updatedItem = response.data

    const index = items.value.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      revokeItemImageURL(items.value[index].id)
      items.value[index] = updatedItem
    }

    await loadImageForItem(updatedItem)
    return updatedItem
  }

  async function deleteItem(itemId: string) {
    await mainApi.deleteItem(itemId)
    const index = items.value.findIndex(item => item.id === itemId)
    if (index !== -1) {
      revokeItemImageURL(itemId)
      items.value.splice(index, 1)
    }
  }

  function getItemById(id: string): IItem | undefined {
    return items.value.find(item => item.id === id)
  }

  return {
    // State
    items,
    imageUrls,
    itemsLoading,
    itemsError,
    // Getters
    shopItems,
    portfolioItems,
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    // Utils
    getItemById,
    revokeItemImageURL,
    loadImageForItem,
  }
})

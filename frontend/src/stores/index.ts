import { useCategoriesStore } from './categories'
import { useMaterialsStore } from './materials'
import { useItemsStore } from './items'
import { useTechnologiesStore } from './technologies'

// Export individual stores
export { useCategoriesStore } from './categories'
export { useMaterialsStore } from './materials'
export { useItemsStore } from './items'
export { useTechnologiesStore } from './technologies'

// Composite function for fetching all initial data
export async function fetchInitialData() {
  const categoriesStore = useCategoriesStore()
  const materialsStore = useMaterialsStore()
  const itemsStore = useItemsStore()

  await Promise.all([
    categoriesStore.fetchCategories(),
    materialsStore.fetchMaterials(),
    itemsStore.fetchItems()
  ])
}

// Legacy support - composite store that uses individual stores
// This maintains backward compatibility with existing code
export const useProductDataStore = () => {
  const categoriesStore = useCategoriesStore()
  const materialsStore = useMaterialsStore()
  const itemsStore = useItemsStore()

  return {
    // State from all stores
    categories: categoriesStore.categories,
    materials: materialsStore.materials,
    items: itemsStore.items,
    imageUrls: itemsStore.imageUrls,
    itemsLoading: itemsStore.itemsLoading,
    itemsError: itemsStore.itemsError,
    // Getters
    shopItems: itemsStore.shopItems,
    portfolioItems: itemsStore.portfolioItems,
    // Actions
    fetchInitialData,
    fetchCategories: categoriesStore.fetchCategories,
    fetchMaterials: materialsStore.fetchMaterials,
    fetchItems: itemsStore.fetchItems,
    createItem: itemsStore.createItem,
    updateItem: itemsStore.updateItem,
    deleteItem: itemsStore.deleteItem,
    addCategory: categoriesStore.addCategory,
    updateCategory: categoriesStore.updateCategory,
    removeCategory: categoriesStore.removeCategory,
    addMaterial: materialsStore.addMaterial,
    updateMaterial: materialsStore.updateMaterial,
    removeMaterial: materialsStore.removeMaterial,
    // Utils
    getItemById: itemsStore.getItemById,
    revokeItemImageURL: itemsStore.revokeItemImageURL,
  }
}
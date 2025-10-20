import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // **ЗМІНА**: Додано computed
import type { ICategory, IItem, IMaterial } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useProductDataStore = defineStore('productData', () => {
  const categories = ref<ICategory[]>([]);
  const materials = ref<IMaterial[]>([]);
  const items = ref<IItem[]>([]);
  const imageUrls = ref<Record<string, string>>({});
  const itemsLoading = ref(false);
  const itemsError = ref<string | null>(null);
  const shopItems = computed(() => items.value.filter(item => !item.isUnique));
  const portfolioItems = computed(() => items.value.filter(item => item.isUnique));

  async function loadImageForItem(item: IItem) {
    if (!item?.id || imageUrls.value[item.id]) return;

    try {
      const response = await mainApi.getImage(item.id);
      const blob = response.data;
      imageUrls.value[item.id] = URL.createObjectURL(blob);
    } catch (err) {
      console.error(`Error loading image for item ${item.id}:`, err);
    }
  }

  async function loadAllItemImages() {
    const promises = items.value.map(item => loadImageForItem(item));
    await Promise.all(promises);
  }

  async function fetchCategories() {
    try {
      const res = await mainApi.getAllCategories();
      categories.value = res.data;
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  }

  async function fetchMaterials() {
    try {
      const res = await mainApi.getAllMaterials();
      materials.value = res.data;
    } catch (e) {
      console.error('Error fetching materials', e);
    }
  }

  async function fetchItems() {
    if (items.value.length > 0 && !itemsError.value) return;

    itemsLoading.value = true;
    itemsError.value = null;
    try {
      const response = await mainApi.getAllItems();
      items.value = response.data;
      await loadAllItemImages();
    } catch (err: any) {
      itemsError.value = err.message || 'Помилка завантаження товарів';
      console.error('Error fetching items:', err);
    } finally {
      itemsLoading.value = false;
    }
  }

  async function fetchInitialData() {
    await Promise.all([
      fetchCategories(),
      fetchMaterials(),
      fetchItems()
    ]);
  }

  async function createItem(formData: FormData): Promise<IItem> {
    const response = await mainApi.createItem(formData);
    const newItem = response.data;
    items.value.unshift(newItem);
    await loadImageForItem(newItem);
    return newItem;
  }

  async function updateItem(itemId: string, formData: FormData): Promise<IItem> {
    const response = await mainApi.updateItem(itemId, formData);
    const updatedItem = response.data;

    const index = items.value.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      revokeItemImageURL(items.value[index].id);
      items.value[index] = updatedItem;
    }

    await loadImageForItem(updatedItem);
    return updatedItem;
  }

  async function deleteItem(itemId: string) {
    await mainApi.deleteItem(itemId);
    const index = items.value.findIndex(item => item.id === itemId);
    if (index !== -1) {
      revokeItemImageURL(itemId);
      items.value.splice(index, 1);
    }
  }

  function addCategory(newCategory: ICategory) {
    categories.value.push(newCategory);
  }

  function updateCategory(updatedCategory: ICategory) {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      categories.value[index] = updatedCategory;
    }
  }

  function removeCategory(categoryId: string | number) {
    categories.value = categories.value.filter(c => c.id !== categoryId);
  }

  function addMaterial(newMaterial: IMaterial) {
    materials.value.push(newMaterial);
  }

  function updateMaterial(updatedMaterial: IMaterial) {
    const index = materials.value.findIndex(m => m.id === updatedMaterial.id);
    if (index !== -1) {
      materials.value[index] = updatedMaterial;
    }
  }

  function removeMaterial(materialId: string | number) {
    materials.value = materials.value.filter(m => m.id !== materialId);
  }

  function getItemById(id: string): IItem | undefined {
    return items.value.find(item => item.id === id);
  }

  function revokeItemImageURL(itemId: string) {
    if (imageUrls.value[itemId]) {
      URL.revokeObjectURL(imageUrls.value[itemId]);
      delete imageUrls.value[itemId];
    }
  }

  return {
    // State
    categories,
    materials,
    items,
    imageUrls,
    itemsLoading,
    itemsError,
    // Getters
    shopItems,     
    portfolioItems,
    // Actions
    fetchInitialData,
    fetchCategories,
    fetchMaterials,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    removeCategory,
    addMaterial,
    updateMaterial,
    removeMaterial,
    // Utils
    getItemById,
    revokeItemImageURL,
  }
})
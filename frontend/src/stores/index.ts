import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ICategory, IItem, IMaterial } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useProductDataStore = defineStore('productData', () => {
  const categories = ref<ICategory[]>([]);
  const materials = ref<IMaterial[]>([]);
  const items = ref<IItem[]>([]);
  const imageUrls = ref<Record<string, string>>({});
  const itemsLoading = ref(false);
  const itemsError = ref<string | null>(null);

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

  function getItemById(id: string): IItem | undefined {
    return items.value.find(item => item.id === id);
  }

  function updateItemInState(updatedItem: IItem) {
    const index = items.value.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items.value[index] = updatedItem;
    }
  }

  async function loadAllItemImages() {
    const imagePromises = items.value.map(async (item) => {
      if (imageUrls.value[item.id]) return;

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

  async function fetchItems() {
    if (items.value.length > 0) return;

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

  function addItem(newItem: IItem) {
    items.value.unshift(newItem);
  }

  function updateItem(updatedItem: IItem) {
    const index = items.value.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items.value[index] = updatedItem;
    }
  }

  async function createItem(formData: FormData): Promise<IItem> {
    const response = await mainApi.createItem(formData);
    addItem(response.data);
    await loadAllItemImages();
    return response.data;
  }

  async function fetchInitialData() {
    await Promise.all([
      fetchCategories(),
      fetchMaterials(),
      fetchItems()
    ]);
  }

  function addCategory(newCategory: ICategory) {
    categories.value.push(newCategory);
  }

  function addMaterial(newMaterial: IMaterial) {
    materials.value.push(newMaterial);
  }

  return {
    categories,
    materials,
    items,
    imageUrls,
    itemsLoading,
    itemsError,
    fetchCategories,
    fetchMaterials,
    fetchItems,
    fetchInitialData,
    addCategory,
    addMaterial,
    addItem,
    updateItem,
    loadAllItemImages
  }
})
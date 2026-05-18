import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IMaterial } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref<IMaterial[]>([])

  async function fetchMaterials() {
    try {
      const res = await mainApi.getAllMaterials()
      materials.value = res.data
    } catch (e) {
      console.error('Error fetching materials', e)
    }
  }

  function addMaterial(newMaterial: IMaterial) {
    materials.value.push(newMaterial)
  }

  function updateMaterial(updatedMaterial: IMaterial) {
    const index = materials.value.findIndex(m => m.id === updatedMaterial.id)
    if (index !== -1) {
      materials.value[index] = updatedMaterial
    }
  }

  function removeMaterial(materialId: string | number) {
    materials.value = materials.value.filter(m => m.id !== materialId)
  }

  return {
    // State
    materials,
    // Actions
    fetchMaterials,
    addMaterial,
    updateMaterial,
    removeMaterial,
  }
})

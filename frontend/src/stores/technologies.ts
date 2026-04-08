import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ITechnology } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useTechnologiesStore = defineStore('technologies', () => {
  const technologies = ref<ITechnology[]>([])

  async function fetchTechnologies() {
    try {
      const res = await mainApi.getAllTechnologies()
      technologies.value = res.data
    } catch (e) {
      console.error('Error fetching technologies', e)
    }
  }

  function addTechnology(newTechnology: ITechnology) {
    technologies.value.push(newTechnology)
  }

  function updateTechnology(updatedTechnology: ITechnology) {
    const index = technologies.value.findIndex(t => t.id === updatedTechnology.id)
    if (index !== -1) {
      technologies.value[index] = updatedTechnology
    }
  }

  function removeTechnology(technologyId: string | number) {
    technologies.value = technologies.value.filter(t => t.id !== technologyId)
  }

  return {
    // State
    technologies,
    // Actions
    fetchTechnologies,
    addTechnology,
    updateTechnology,
    removeTechnology,
  }
})

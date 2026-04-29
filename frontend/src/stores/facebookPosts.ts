import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IFacebookPost } from '@/interfaces'
import mainApi from '@/api/main.api'

export const useFacebookPostsStore = defineStore('facebookPosts', () => {
  const posts = ref<IFacebookPost[]>([])

  async function fetchPosts() {
    try {
      const res = await mainApi.getFacebookPosts()
      posts.value = res.data
    } catch (e) {
      console.error('Error fetching facebook posts', e)
    }
  }

  function addPost(post: IFacebookPost) {
    posts.value.push(post)
  }

  function updatePost(updated: IFacebookPost) {
    const index = posts.value.findIndex(p => p.id === updated.id)
    if (index !== -1) {
      posts.value[index] = updated
    }
  }

  function removePost(id: string) {
    posts.value = posts.value.filter(p => p.id !== id)
  }

  return {
    posts,
    fetchPosts,
    addPost,
    updatePost,
    removePost,
  }
})

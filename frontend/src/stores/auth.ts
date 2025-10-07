import { ref } from 'vue'
import { defineStore } from 'pinia'
import authApi from '@/api/main.api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<any>(null)
  const error = ref<string | null>(null)

  const setToken = (t: string | null) => {
    token.value = t
    if (t) localStorage.setItem('auth_token', t)
    else localStorage.removeItem('auth_token')
  }

  const login = async (credentials: { email: string; password: string }) => {
    error.value = null
    try {
      const res = await authApi.login(credentials)
      const data = res.data
      setToken(data.token)
      user.value = data.user || null
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message || 'Login failed'
      throw err
    }
  }

  const register = async (payload: { name: string; email: string; password: string }) => {
    error.value = null
    try {
      const res = await authApi.register(payload)
      const data = res.data
      setToken(data.token)
      user.value = data.user || null
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message || 'Registration failed'
      throw err
    }
  }

  const logout = () => {
    setToken(null)
    user.value = null
  }

  return { token, user, error, login, register, logout }
})

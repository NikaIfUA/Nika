import { defineStore } from 'pinia'
import authApi from '@/api/main.api'
import { cacheSet, cacheGet, cacheRemove } from '@/utils/cacheAuth'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null as string | null, user: null as any, error: null as string | null, allowed: false as boolean }),
  actions: {
    async initFromCache() {
      try {
        const t = await cacheGet('auth_token')
        const u = await cacheGet('auth_user')
        this.token = t
        this.user = u ? JSON.parse(u) : null
        if (this.token) {
          const res = await authApi.checkAuth();
          if (res.status === 200 && res.data?.allowed) this.allowed = true;
        } else {
          this.allowed = false;
        }
      } catch (e) {
        // ignore
      }
    },

    async setToken(t: string | null) {
      this.token = t
      if (t) await cacheSet('auth_token', t)
      else await cacheRemove('auth_token')
      if (t) {
        await this.verifyToken();
      } else {
        this.allowed = false;
      }
    },

    async verifyToken() {
      if (!this.token) {
        this.allowed = false;
        return;
      }
      try {
        const res = await authApi.checkAuth();
        if (res.status === 200 && res.data?.allowed) {
          this.allowed = true;
          this.user = res.data.user ?? this.user;
          if (this.user) await cacheSet('auth_user', JSON.stringify(this.user));
        } else {
          this.allowed = false;
        }
      } catch (e) {
        this.allowed = false;
      }
    },

    async login(credentials: { email: string; password: string }) {
      this.error = null
      try {
        const res = await authApi.login(credentials)
        const data = res.data
        await this.setToken(data.token)
        this.user = data.user || null
        if (data.user) await cacheSet('auth_user', JSON.stringify(data.user))
        return data
      } catch (err: any) {
        this.error = err?.response?.data?.message || err.message || 'Login failed'
        throw err
      }
    },

    async register(payload: { name: string; email: string; password: string }) {
      this.error = null
      try {
        const res = await authApi.register(payload)
        const data = res.data
        await this.setToken(data.token)
        this.user = data.user || null
        if (data.user) await cacheSet('auth_user', JSON.stringify(data.user))
        return data
      } catch (err: any) {
        this.error = err?.response?.data?.message || err.message || 'Registration failed'
        throw err
      }
    },

    async logout() {
      try {
        await authApi.logout().catch(() => null)
      } catch (e) {
        // ignore
      }
      await this.setToken(null)
      this.user = null
      await cacheRemove('auth_user')
      this.allowed = false;
    },

    isAuthenticated() {
      return !!this.token && this.allowed
    }
  }
})

import { API_URL } from '@/env';
import axios, { type AxiosResponse } from 'axios';
import type { IImage, IItem } from '@/interfaces';

const instance = axios.create({ baseURL: API_URL });

// Attach Bearer token if present
instance.interceptors.request.use(async (config) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('auth-cache');
      const res = await cache.match('/auth/auth_token');
      if (res) {
        const token = await res.text();
        if (token) {
          if (!config.headers) (config as any).headers = {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});


const mainApi = {
  getAllItems: (): Promise<AxiosResponse<IItem[]>> => {
    return instance.get('/items');
  },

  getItemById: (id: string): Promise<AxiosResponse<IItem>> => {
    return instance.get(`/items/${id}`);
  },

  createItem: (formData: FormData): Promise<AxiosResponse<IItem>> => {
    return instance.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateItem: (id: string, formData: FormData): Promise<AxiosResponse<IItem>> => {
    return instance.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteItem: (id: string): Promise<AxiosResponse<{ message: string }>> => {
    return instance.delete(`/items/${id}`);
  },

  getImage: (itemId: string): Promise<AxiosResponse<Blob>> => {
    return instance.get(`/items/${itemId}/image`, { responseType: 'blob' });
  },

  getImageUrl: (itemId: string): string => {
    return `${API_URL}/items/${itemId}/image`;
  },

  getAllCategories: (): Promise<AxiosResponse<any[]>> => {
    return instance.get(`/get-categories`);
  },

  saveCategory: (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return instance.post(`/save-category`, payload);
  },

  getAllMaterials: (): Promise<AxiosResponse<any[]>> => {
    return instance.get(`/get-materials`);
  },

  saveMaterial: (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return instance.post(`/save-material`, payload);
  },

  login: (credentials: { email: string; password: string }) => {
    return instance.post(`/auth/login`, credentials);
  },

  register: (data: { name: string; email: string; password: string }) => {
    return instance.post(`/auth/register`, data);
  },

  logout: () => {
    return instance.post(`/auth/logout`);
  },

  checkAuth: () => {
    return instance.get(`/auth/check`);
  },
};

export default mainApi;

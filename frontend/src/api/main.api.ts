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
  // --- Item API ---

  // ✅ CORRECTED: Отримує всі товари
  getAllItems: (): Promise<AxiosResponse<IItem[]>> => {
    return instance.get('/items');
  },

  // ✅ CORRECTED: Отримує один товар за ID
  getItemById: (id: string): Promise<AxiosResponse<IItem>> => {
    return instance.get(`/items/${id}`);
  },

  // ✅ CORRECTED: Створює новий товар
  createItem: (formData: FormData): Promise<AxiosResponse<IItem>> => {
    return instance.post('/items', formData, { // <-- Змінено шлях з '/save-item' на '/items'
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ✅ CORRECTED: Оновлює товар за ID
  updateItem: (id: string, formData: FormData): Promise<AxiosResponse<IItem>> => {
    return instance.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ✅ CORRECTED: Отримує файл зображення для товару
  getImage: (itemId: string): Promise<AxiosResponse<Blob>> => {
    return instance.get(`/items/${itemId}/image`, { responseType: 'blob' });
  },

  // --- Category & Material API ---

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

  // --- Auth API ---

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

  getImageUrl: (itemId: string): string => {
    return `${API_URL}/items/${itemId}/image`;
  },
};

export default mainApi;

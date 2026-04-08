import { API_URL } from '@/env';
import axios, { type AxiosResponse } from 'axios';
import type { IImage, IItem, IMaterial, ITechnology } from '@/interfaces';

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

  getAllImages: (itemId: string, imageId: string): Promise<AxiosResponse<Blob>> => {
    return instance.get(`/items/${itemId}/images/${imageId}`, { responseType: 'blob' });
  },

  getAllCategories: (): Promise<AxiosResponse<any[]>> => {
    return instance.get(`/get-categories`);
  },

  saveCategory: (payload: FormData | { name: string; description?: string }): Promise<AxiosResponse<any>> => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.post(`/save-category`, payload, config);
  },

  updateCategory: (id: string, data: FormData | { name: string; description?: string }): Promise<AxiosResponse<any>> => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.put(`/categories/${id}`, data, config);
  },
  
  deleteCategory: (id: string): Promise<AxiosResponse<void>> => {
    return instance.delete(`/categories/${id}`);
  },

  getCategoryImageUrl: (categoryId: string, imageId: string): string => {
    return `${API_URL}/categories/${categoryId}/images/${imageId}`;
  },

  getAllMaterials: (): Promise<AxiosResponse<IMaterial[]>> => {
    return instance.get(`/get-materials`);
  },

  saveMaterial: (payload: FormData | { name: string; description?: string; parentId?: string | null }): Promise<AxiosResponse<IMaterial>> => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.post(`/save-material`, payload, config);
  },

  updateMaterial(id: string, data: FormData | { name: string; description?: string; parentId?: string | null }): Promise<AxiosResponse<IMaterial>> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.put(`/materials/${id}`, data, config);
  },

  deleteMaterial(id: string): Promise<AxiosResponse<void>> {
    return instance.delete(`/materials/${id}`);
  },

  getMaterialImageUrl: (materialId: string, imageId: string): string => {
    return `${API_URL}/materials/${materialId}/images/${imageId}`;
  },

  getAllTechnologies: (): Promise<AxiosResponse<ITechnology[]>> => {
    return instance.get(`/get-technologies`);
  },

  getInfoTree: (): Promise<AxiosResponse<{ materials: IMaterial[]; technologies: ITechnology[]; cachedAt: string }>> => {
    return instance.get(`/get-info-tree`);
  },

  getInfoTreeChildren: (type: 'material' | 'technology', parentId: string | null): Promise<AxiosResponse<{ items: Array<{ id: string; name: string; slug: string; description: string | null; parentId: string | null; hasChildren: boolean }>; cachedAt: string }>> => {
    const params: Record<string, string> = { type };
    if (parentId) params.parentId = parentId;
    return instance.get(`/get-info-tree/children`, { params });
  },

  getTechnologyBySlug: (slug: string): Promise<AxiosResponse<ITechnology>> => {
    return instance.get(`/technologies/${slug}`);
  },

  saveTechnology: (payload: FormData | { name: string; description?: string; parentId?: string | null }): Promise<AxiosResponse<ITechnology>> => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.post(`/save-technology`, payload, config);
  },

  updateTechnology(id: string, data: FormData | { name: string; description?: string; parentId?: string | null }): Promise<AxiosResponse<ITechnology>> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return instance.put(`/technologies/${id}`, data, config);
  },

  deleteTechnology(id: string): Promise<AxiosResponse<void>> {
    return instance.delete(`/technologies/${id}`);
  },

  getTechnologyImageUrl: (technologyId: string, imageId: string): string => {
    return `${API_URL}/technologies/${technologyId}/images/${imageId}`;
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

  sendContactMessage: (data: { subject: string; description: string; email: string; source: string }) => {
    return instance.post(`/contact`, data);
  },
};

export default mainApi;

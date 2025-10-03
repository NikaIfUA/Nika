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
  getFileContent: async (fileName: string): Promise<AxiosResponse<string>> => {
    return await instance.get(`/get-file-content/${fileName}`);
  },

  getInfo: async (): Promise<AxiosResponse<string>> => {
    return await instance.get(`/get-info`);
  },

  getAllImages: async (): Promise<AxiosResponse<IImage[]>> => {
    return await instance.get(`/get-all-images`);
  },

  getImageById: async (id: string): Promise<AxiosResponse<Blob>> => {
    return await instance.get(`/get-image-by-id/${id}`, { responseType: 'blob' });
  },

  getAllCategories: async (): Promise<AxiosResponse<any[]>> => {
    return await instance.get(`/get-categories`);
  },

  saveCategory: async (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return await axios.post(`${API_URL}/save-category`, payload);
  },

  saveMaterial: async (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return await axios.post(`${API_URL}/save-material`, payload);
  },

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await instance.get(`/get-materials`);
  },

  login: async (credentials: { email: string; password: string }) => {
    return await instance.post(`/auth/login`, credentials)
  },
  
  register: async (data: { name: string; email: string; password: string }) => {
    return await instance.post(`/auth/register`, data)
  },

  logout: async () => {
    return await instance.post(`/auth/logout`)
  },

  saveImage: async (formData: FormData): Promise<AxiosResponse<any>> => {
    // Let browser/axios set multipart Content-Type with proper boundary automatically
    return await axios.post(`${API_URL}/save-image`, formData);
  },

  checkAuth: async () => { return await instance.get(`/auth/check`) },

  // Use the backend endpoint that returns full item objects (including images)
  getAllItems: async (): Promise<AxiosResponse<IItem[]>> => {
    return await axios.get(`${API_URL}/get-all-images`);
  },

  // Item image endpoint (returns raw file when stored locally)
  getImage: async (itemId: string): Promise<AxiosResponse<Blob>> => {
    // API_URL already contains '/api', so we construct the full path by replacing it
    const baseUrl = API_URL.replace('/api', '');
    return await axios.get(`${baseUrl}/api/items/${itemId}/image`, { responseType: 'blob' });
  }
};

export default mainApi;

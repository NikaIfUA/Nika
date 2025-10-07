import { API_URL } from '@/env';
import axios, { type AxiosResponse } from 'axios';
import type { IImage } from '@/interfaces';


const mainApi = {
  getFileContent: async (fileName: string): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-file-content/${fileName}`);
  },

  getInfo: async (): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-info`);
  },

  getAllImages: async (): Promise<AxiosResponse<IImage[]>> => {
    return await axios.get(`${API_URL}/get-all-images`);
  },

  getImageById: async (id: string): Promise<AxiosResponse<Blob>> => {
    return await axios.get(`${API_URL}/get-image-by-id/${id}`, { responseType: 'blob' });
  },

  getAllCategories: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-categories`);
  },

  saveCategory: async (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return await axios.post(`${API_URL}/save-category`, payload);
  },

  saveMaterial: async (payload: { name: string }): Promise<AxiosResponse<any>> => {
    return await axios.post(`${API_URL}/save-material`, payload);
  },

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-materials`);
  },

  login: async (credentials: { email: string; password: string }) => {
    return await axios.post(`${API_URL}/auth/login`, credentials)
  },
  
  register: async (data: { name: string; email: string; password: string }) => {
    return await axios.post(`${API_URL}/auth/register`, data)
  }
,

  saveImage: async (formData: FormData): Promise<AxiosResponse<any>> => {
    // Let browser/axios set multipart Content-Type with proper boundary automatically
    return await axios.post(`${API_URL}/save-image`, formData);
  }
};

export default mainApi;

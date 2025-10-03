import { API_URL } from '@/env';
import axios, { type AxiosResponse } from 'axios';
import type { IItem } from '@/interfaces';


const mainApi = {
  getFileContent: async (fileName: string): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-file-content/${fileName}`);
  },

  getInfo: async (): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-info`);
  },

  getAllImages: async (): Promise<AxiosResponse<IItem[]>> => {
    return await axios.get(`${API_URL}/get-all-images`);
  },

  getAllCategories: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-categories`);
  },

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-materials`);
  },

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

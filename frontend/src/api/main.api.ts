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

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-materials`);
  }
};

export default mainApi;

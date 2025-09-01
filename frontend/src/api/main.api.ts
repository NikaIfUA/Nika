import { API_URL } from '@/env';
import type { IImage } from '@/interfaces';
import axios, { type AxiosResponse } from 'axios';


const mainApi = {
  getFileContent: async (fileName: string): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-file-content/${fileName}`);
  },

  getInfo: async (): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-info`);
  },

  getAllImages: async (): Promise<AxiosResponse<IImage>> => {
    return await axios.get(`${API_URL}/get-images`);
  },

  getImageUrlById: (imageId: string): string => {
    return `${API_URL}/get-images/${imageId}`;
  },

  getAllCategories: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-categories`);
  },

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-materials`);
  }
};

export default mainApi;

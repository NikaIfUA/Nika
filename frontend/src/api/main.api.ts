import { API_URL } from '@/env';
import axios, { type AxiosResponse } from 'axios';


const mainApi = {
  getFileContent: async (fileName: string): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-file-content/${fileName}`);
  },

  getInfo: async (): Promise<AxiosResponse<string>> => {
    return await axios.get(`${API_URL}/get-info`);
  },

  getAllImages: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-all-images`);
  },

  getAllCategories: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-categories`);
  },

  getAllMaterials: async (): Promise<AxiosResponse<any[]>> => {
    return await axios.get(`${API_URL}/get-materials`);
  }
};

export default mainApi;

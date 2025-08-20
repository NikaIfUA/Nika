export interface IImage {
  id: string;
  url: string;
  title: string;
  description: string;
  categoryId?: string;
  price?: number;
  amountAvailable?: number;
  materialsIds?: string[];
}

export interface ICategory {
  id: string;
  name: string;
}

export interface IMaterial {
  id: string;
  name: string;
  description?: string;
}

export interface IImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: ICategory | null;
  price?: number | null;
  amountAvailable?: number | null;
  materials?: IMaterial[] | null;
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

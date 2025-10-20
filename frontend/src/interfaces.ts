export interface IItem {
  id: string;
  title: string;
  description?: string | null;
  category?: ICategory | null;
  price?: number | null;
  amountAvailable?: number | null;
  materials?: IMaterial[] | null;
  images: IImage[];
  coverImage: string; //id of main image
}

export interface IImage {
  id: string;
  url: string;
  description?: string;
  resolution: {
    width: number;
    height: number;
  };
  mimeType: string;
  weight?: number | null;
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

export interface IUser {
	id: string;
	name: string;
	email: string;
}

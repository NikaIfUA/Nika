export interface IItem {
  id: string;
  title: string;
  description?: string | null;
  categories?: ICategory[] | null;
  price?: number | null;
  amountAvailable?: number | null;
  materials?: IMaterial[] | null;
  technologies?: ITechnology[] | null;
  images: IImage[];
  coverImage: string; //id of main image
  isUnique: boolean;
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
  slug?: string;
  description?: string;
  image?: IImage | null;
}

export interface IMaterial {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  image?: IImage | null;
}

export interface ITechnology {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: IImage | null;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface IFacebookPost {
  id: string;
  title?: string | null;
  embed_html: string;
  position: number;
  created_at: string;
  updated_at: string;
}

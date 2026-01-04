export interface IProduct {
  id: string;
  base_price: number;
  category_id: string;
  description: string;
  image_url: string;
  is_active: boolean;
  name: string;
  slug: string;
}

export interface IProductTranslation {
  id: string;
  locale: string;
  name: string;
  description: string;
}

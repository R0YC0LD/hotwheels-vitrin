export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

export const CART_STORAGE_KEY = "hw_cart_v1";

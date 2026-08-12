import type { Database } from "@/lib/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ProductType = Database["public"]["Tables"]["product_types"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

export interface ProductWithRelations extends Product {
  images: ProductImage[];
  category: Category | null;
  product_type: ProductType | null;
  tags: Tag[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface SiteSettings {
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_product_id: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  shipping_note: string | null;
  footer_text: string | null;
  show_sold_products: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "Vitrin",
  logo_url: null,
  favicon_url: null,
  hero_title: "Seçilmiş Die-Cast Parçalar.",
  hero_subtitle: "Kişisel koleksiyonumdan satışa çıkardığım seçilmiş modeller.",
  hero_product_id: null,
  instagram_url: null,
  whatsapp_number: null,
  contact_email: null,
  shipping_note: null,
  footer_text: null,
  show_sold_products: true,
};

export const PRODUCT_STATUS_LABELS: Record<Product["status"], string> = {
  draft: "Taslak",
  published: "Yayında",
  sold: "Satıldı",
  hidden: "Gizli",
};

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Bekliyor",
  awaiting_payment: "Ödeme Bekleniyor",
  paid: "Ödendi",
  preparing: "Hazırlanıyor",
  shipped: "Kargolandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

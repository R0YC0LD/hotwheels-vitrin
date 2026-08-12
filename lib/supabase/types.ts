// Elle yazılmış tip tanımları — supabase/migrations/000*.sql ile senkron tutulmalı.
// Canlı bir Supabase projesi bağlandığında `supabase gen types typescript` ile
// yeniden üretilebilir; şema aynı kaldığı sürece bu dosya da geçerlidir.

export type ProductStatus = "draft" | "published" | "sold" | "hidden";
export type PackageType = "carded" | "loose" | "opened";
export type ConditionGrade = "Mint" | "Near Mint" | "Very Good" | "Good" | "Used";
export type CardCondition = "Mint" | "Minor Wear" | "Soft Corners" | "Creased" | "Damaged";
export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type ProfileRole = "customer" | "admin";
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          email: string;
          role: ProfileRole;
          created_at: string;
        }>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_path: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_path?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      product_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["product_types"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          sku: string | null;
          barcode: string | null;
          name: string;
          brand: string | null;
          manufacturer: string | null;
          model: string | null;
          series: string | null;
          subseries: string | null;
          category_id: string | null;
          product_type_id: string | null;
          model_year: number | null;
          production_year: number | null;
          release_year: number | null;
          scale: string | null;
          color: string | null;
          wheel_type: string | null;
          production_country: string | null;
          package_type: PackageType | null;
          condition: ConditionGrade | null;
          card_condition: CardCondition | null;
          condition_notes: string | null;
          price: number;
          sale_price: number | null;
          stock: number;
          status: ProductStatus;
          featured: boolean;
          rare: boolean;
          active: boolean;
          description: string | null;
          collector_note: string | null;
          created_at: string;
          updated_at: string;
          sold_at: string | null;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      product_tags: {
        Row: { product_id: string; tag_id: string };
        Insert: { product_id: string; tag_id: string };
        Update: Partial<{ product_id: string; tag_id: string }>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          email: string;
          phone: string;
          address: string;
          city: string | null;
          district: string | null;
          total: number;
          status: OrderStatus;
          payment_status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          customer_name: string;
          email: string;
          phone: string;
          address: string;
          total: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          price_snapshot: number;
          quantity: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_name_snapshot: string;
          price_snapshot: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      site_settings: {
        Row: { id: string; key: string; value: Json };
        Insert: { id?: string; key: string; value: Json };
        Update: Partial<{ id: string; key: string; value: Json }>;
      };
      activity_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_order: {
        Args: {
          p_customer_name: string;
          p_email: string;
          p_phone: string;
          p_address: string;
          p_city: string | null;
          p_district: string | null;
          p_items: { product_id: string; quantity: number }[];
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
    };
  };
}

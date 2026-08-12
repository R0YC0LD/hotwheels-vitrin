/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase-js infers a loose
   shape for nested embed selects; we normalize to our domain type below. */
import { createPublicClient } from "@/lib/supabase/public";
import type { ProductWithRelations } from "@/lib/types";

const RELATIONS_SELECT =
  "*, images:product_images(*), category:categories(*), product_type:product_types(*), product_tags(tag:tags(*))";

function mapRow(row: any): ProductWithRelations {
  const { product_tags, ...rest } = row;
  return {
    ...rest,
    images: [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    tags: (product_tags ?? []).map((pt: any) => pt.tag).filter(Boolean),
  };
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "featured";

export interface ProductFilters {
  categorySlug?: string;
  brand?: string;
  manufacturer?: string;
  productTypeSlug?: string;
  condition?: string;
  packageType?: string;
  minPrice?: number;
  maxPrice?: number;
  rare?: boolean;
  inStockOnly?: boolean;
  includeSold?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  products: ProductWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const supabase = createPublicClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(RELATIONS_SELECT, { count: "exact" })
    .eq("active", true)
    .is("deleted_at", null);

  query = filters.includeSold
    ? query.in("status", ["published", "sold"])
    : query.eq("status", "published");

  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }
  if (filters.brand) query = query.ilike("brand", filters.brand);
  if (filters.manufacturer) query = query.ilike("manufacturer", filters.manufacturer);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.packageType) query = query.eq("package_type", filters.packageType);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.rare) query = query.eq("rare", true);
  if (filters.inStockOnly) query = query.gt("stock", 0);

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "featured":
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  let products = (data ?? []).map(mapRow);

  // category/product_type slug filtreleri PostgREST'te nested eq ile güvenilir
  // çalışmayabildiğinden (embed filtresi ana satırı elemez, sadece embed'i daraltır),
  // burada ekstra bir güvenlik filtresi uyguluyoruz.
  if (filters.categorySlug) {
    products = products.filter((p) => p.category?.slug === filters.categorySlug);
  }
  if (filters.productTypeSlug) {
    products = products.filter((p) => p.product_type?.slug === filters.productTypeSlug);
  }

  return { products, total: count ?? products.length, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(RELATIONS_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .is("deleted_at", null)
    .in("status", ["published", "sold"])
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

async function fetchSimple(builder: (q: any) => any) {
  const supabase = createPublicClient();
  const { data, error } = await builder(supabase.from("products"));
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getNewArrivals(limit = 8) {
  return fetchSimple((q) =>
    q
      .select(RELATIONS_SELECT)
      .eq("active", true)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
}

export async function getFeaturedProducts(limit = 8) {
  return fetchSimple((q) =>
    q
      .select(RELATIONS_SELECT)
      .eq("active", true)
      .eq("status", "published")
      .eq("featured", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
}

export async function getRareProducts(limit = 8) {
  return fetchSimple((q) =>
    q
      .select(RELATIONS_SELECT)
      .eq("active", true)
      .eq("status", "published")
      .eq("rare", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
}

export async function getRecentlySold(limit = 8) {
  return fetchSimple((q) =>
    q
      .select(RELATIONS_SELECT)
      .eq("active", true)
      .eq("status", "sold")
      .is("deleted_at", null)
      .order("sold_at", { ascending: false })
      .limit(limit)
  );
}

export async function getSoldProductsPage(page = 1, pageSize = 24): Promise<ProductListResult> {
  const supabase = createPublicClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select(RELATIONS_SELECT, { count: "exact" })
    .eq("active", true)
    .eq("status", "sold")
    .is("deleted_at", null)
    .order("sold_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { products: (data ?? []).map(mapRow), total: count ?? 0, page, pageSize };
}

export async function searchProducts(term: string, limit = 24) {
  if (!term.trim()) return [];
  const like = `%${term.trim()}%`;
  return fetchSimple((q) =>
    q
      .select(RELATIONS_SELECT)
      .eq("active", true)
      .is("deleted_at", null)
      .in("status", ["published", "sold"])
      .or(
        `name.ilike.${like},model.ilike.${like},brand.ilike.${like},series.ilike.${like},sku.ilike.${like}`
      )
      .limit(limit)
  );
}

export async function getRelatedProducts(product: ProductWithRelations, limit = 4) {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(RELATIONS_SELECT)
    .eq("active", true)
    .eq("status", "published")
    .is("deleted_at", null)
    .neq("id", product.id)
    .limit(limit);

  if (product.category_id) query = query.eq("category_id", product.category_id);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

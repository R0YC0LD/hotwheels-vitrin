/* eslint-disable @typescript-eslint/no-explicit-any -- server client here isn't generically
   typed against Database (see lib/supabase/public.ts note); shapes are asserted manually. */
import "server-only";
import { slugify } from "@/lib/slug";
import type { ProductFormValues } from "@/lib/validation/product";

const RELATIONS_SELECT =
  "*, images:product_images(*), category:categories(*), product_type:product_types(*), product_tags(tag:tags(*))";

function mapRow(row: any) {
  if (!row) return null;
  const { product_tags, ...rest } = row;
  return {
    ...rest,
    images: [...(row.images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order),
    tags: (product_tags ?? []).map((pt: any) => pt.tag).filter(Boolean),
  };
}

async function uniqueSlug(supabase: any, base: string, excludeId?: string) {
  const slugBase = slugify(base) || "urun";
  let candidate = slugBase;
  let attempt = 1;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${slugBase}-${attempt}`;
  }
}

export async function logActivity(
  supabase: any,
  adminId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>
) {
  await supabase
    .from("activity_logs")
    .insert({ admin_id: adminId, action, entity, entity_id: entityId ?? null, metadata: metadata ?? null });
}

export interface AdminProductListFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listAdminProducts(supabase: any, filters: AdminProductListFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) {
    const like = `%${filters.search}%`;
    query = query.or(`name.ilike.${like},sku.ilike.${like},brand.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: (data ?? []).map((row: any) => ({
      ...row,
      images: [...(row.images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order),
    })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminProductById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return mapRow(data);
}

function toProductRow(values: Partial<ProductFormValues>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tagIds, ...rest } = values;
  const row: Record<string, unknown> = { ...rest };
  Object.keys(row).forEach((key) => {
    if (row[key] === undefined) delete row[key];
  });
  return row;
}

async function syncTags(supabase: any, productId: string, tagIds: string[] | undefined) {
  if (tagIds === undefined) return;
  await supabase.from("product_tags").delete().eq("product_id", productId);
  if (tagIds.length > 0) {
    await supabase
      .from("product_tags")
      .insert(tagIds.map((tagId) => ({ product_id: productId, tag_id: tagId })));
  }
}

export async function createProduct(
  supabase: any,
  adminId: string,
  values: Partial<ProductFormValues> & { name: string; price: number }
) {
  const slug = await uniqueSlug(supabase, values.name);
  const row = toProductRow(values);

  const { data, error } = await supabase
    .from("products")
    .insert({ ...row, slug })
    .select()
    .single();

  if (error) throw error;

  await syncTags(supabase, data.id, values.tagIds);
  await logActivity(supabase, adminId, "product_created", "product", data.id, { name: values.name });

  return data;
}

export async function updateProduct(
  supabase: any,
  adminId: string,
  id: string,
  values: Partial<ProductFormValues>
) {
  const { data: before } = await supabase
    .from("products")
    .select("price, stock, status, name")
    .eq("id", id)
    .single();

  const row = toProductRow(values);

  if (values.name && values.name !== before?.name) {
    row.slug = await uniqueSlug(supabase, values.name, id);
  }

  const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
  if (error) throw error;

  await syncTags(supabase, id, values.tagIds);

  if (before && values.price !== undefined && Number(before.price) !== Number(values.price)) {
    await logActivity(supabase, adminId, "price_changed", "product", id, {
      from: before.price,
      to: values.price,
    });
  }
  if (before && values.stock !== undefined && Number(before.stock) !== Number(values.stock)) {
    await logActivity(supabase, adminId, "stock_changed", "product", id, {
      from: before.stock,
      to: values.stock,
    });
  }

  return data;
}

export async function setProductStatus(
  supabase: any,
  adminId: string,
  id: string,
  status: "draft" | "published" | "sold" | "hidden"
) {
  const patch: Record<string, unknown> = { status };
  if (status === "sold") {
    patch.stock = 0;
    patch.sold_at = new Date().toISOString();
  }

  const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();
  if (error) throw error;

  await logActivity(supabase, adminId, `product_${status}`, "product", id);
  return data;
}

export async function softDeleteProduct(supabase: any, adminId: string, id: string) {
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id);
  if (error) throw error;
  await logActivity(supabase, adminId, "product_deleted", "product", id);
}

export async function duplicateProduct(supabase: any, adminId: string, id: string) {
  const original = await getAdminProductById(supabase, id);
  if (!original) throw new Error("PRODUCT_NOT_FOUND");

  const keysToStrip = [
    "id",
    "slug",
    "created_at",
    "updated_at",
    "sold_at",
    "deleted_at",
    "images",
    "category",
    "product_type",
    "tags",
  ] as const;
  const rest: Record<string, unknown> = { ...original };
  const tags = original.tags as { id: string }[];
  keysToStrip.forEach((key) => delete rest[key]);

  const newSlug = await uniqueSlug(supabase, `${original.name}-kopya`);

  const { data, error } = await supabase
    .from("products")
    .insert({ ...rest, slug: newSlug, status: "draft", stock: 1, sold_at: null })
    .select()
    .single();

  if (error) throw error;

  if (tags?.length) {
    await supabase
      .from("product_tags")
      .insert(tags.map((t: { id: string }) => ({ product_id: data.id, tag_id: t.id })));
  }

  await logActivity(supabase, adminId, "product_duplicated", "product", data.id, { from: id });
  return data;
}

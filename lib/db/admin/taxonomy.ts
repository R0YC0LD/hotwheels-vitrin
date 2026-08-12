/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { slugify } from "@/lib/slug";

async function uniqueSlug(supabase: any, table: string, base: string, excludeId?: string) {
  const slugBase = slugify(base) || "item";
  let candidate = slugBase;
  let attempt = 1;

  while (true) {
    let query = supabase.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${slugBase}-${attempt}`;
  }
}

export async function createCategory(
  supabase: any,
  values: { name: string; description?: string; active?: boolean }
) {
  const slug = await uniqueSlug(supabase, "categories", values.name);
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: values.name, slug, description: values.description || null, active: values.active ?? true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  supabase: any,
  id: string,
  values: { name?: string; description?: string; active?: boolean }
) {
  const patch: Record<string, unknown> = { ...values };
  if (values.name) patch.slug = await uniqueSlug(supabase, "categories", values.name, id);
  const { data, error } = await supabase.from("categories").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(supabase: any, id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function createTag(supabase: any, name: string) {
  const slug = await uniqueSlug(supabase, "tags", name);
  const { data, error } = await supabase.from("tags").insert({ name, slug }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTag(supabase: any, id: string) {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}

export async function createProductType(supabase: any, name: string) {
  const slug = await uniqueSlug(supabase, "product_types", name);
  const { data, error } = await supabase.from("product_types").insert({ name, slug }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProductType(supabase: any, id: string) {
  const { error } = await supabase.from("product_types").delete().eq("id", id);
  if (error) throw error;
}

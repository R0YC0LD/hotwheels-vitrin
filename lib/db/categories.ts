import { createPublicClient } from "@/lib/supabase/public";
import type { Category } from "@/lib/types";

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  return data;
}

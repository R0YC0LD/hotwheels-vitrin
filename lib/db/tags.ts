import { createPublicClient } from "@/lib/supabase/public";
import type { Tag } from "@/lib/types";

export async function getAllTags(): Promise<Tag[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getProductTypes() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("product_types").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

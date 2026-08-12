import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">Kategoriler</h1>
      <CategoryManager initialCategories={data ?? []} />
    </div>
  );
}

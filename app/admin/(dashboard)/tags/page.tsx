import type { Metadata } from "next";
import { SimpleTaxonomyManager } from "@/components/admin/simple-taxonomy-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Etiketler" };

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const [{ data: tags }, { data: productTypes }] = await Promise.all([
    supabase.from("tags").select("*").order("name"),
    supabase.from("product_types").select("*").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">Etiketler</h1>
        <SimpleTaxonomyManager
          initialItems={tags ?? []}
          apiBase="/api/admin/tags"
          emptyTitle="Henüz etiket yok."
          placeholder="Örn. Porsche, Vintage, Rare..."
        />
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">Ürün Tipleri</h2>
        <SimpleTaxonomyManager
          initialItems={productTypes ?? []}
          apiBase="/api/admin/product-types"
          emptyTitle="Henüz ürün tipi yok."
          placeholder="Örn. Exclusive, Custom..."
        />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { ProductGrid } from "@/components/site/product-grid";
import { EmptyState } from "@/components/site/empty-state";
import { searchProducts } from "@/lib/db/products";

export const metadata: Metadata = { title: "Arama" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = q ? await searchProducts(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {q ? `"${q}" için sonuçlar` : "Arama"}
      </h1>
      <p className="mt-1 mb-8 text-sm text-foreground-secondary">
        {q ? `${products.length} sonuç bulundu` : "Model, marka, seri veya SKU ile arayın."}
      </p>

      {!q ? (
        <EmptyState title="Aramaya başlamak için üst menüdeki arama simgesini kullanın." />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

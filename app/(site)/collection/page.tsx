import type { Metadata } from "next";
import { CollectionFilters, SortSelect } from "@/components/site/collection-filters";
import { CollectionResults } from "@/components/site/load-more-products";
import { getProducts, type SortOption } from "@/lib/db/products";
import { getActiveCategories } from "@/lib/db/categories";
import { getProductTypes } from "@/lib/db/tags";
import { getSiteSettings } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Koleksiyon",
  description: "Satışta olan tüm die-cast koleksiyon parçaları.",
};

interface SearchParams {
  category?: string;
  type?: string;
  condition?: string;
  package?: string;
  minPrice?: string;
  maxPrice?: string;
  rare?: string;
  inStock?: string;
  sort?: string;
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const settings = await getSiteSettings();

  const [{ products, total }, categories, productTypes] = await Promise.all([
    getProducts({
      categorySlug: sp.category,
      productTypeSlug: sp.type,
      condition: sp.condition,
      packageType: sp.package,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      rare: sp.rare === "true",
      inStockOnly: sp.inStock === "true",
      includeSold: settings.show_sold_products,
      sort: (sp.sort as SortOption) ?? "newest",
      page: 1,
      pageSize: 24,
    }),
    getActiveCategories(),
    getProductTypes(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Koleksiyon
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">{total} parça</p>
        </div>
        <div className="hidden md:block">
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <CollectionFilters categories={categories} productTypes={productTypes} />
        </aside>

        <div>
          <CollectionResults initialProducts={products} total={total} />
        </div>
      </div>
    </div>
  );
}

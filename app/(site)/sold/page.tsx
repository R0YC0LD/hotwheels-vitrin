import type { Metadata } from "next";
import { CollectionResults } from "@/components/site/load-more-products";
import { getSoldProductsPage } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Satılanlar",
  description: "Daha önce koleksiyondan satılmış parçaların arşivi.",
};

export default async function SoldPage() {
  const { products, total } = await getSoldProductsPage(1, 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Satılanlar
      </h1>
      <p className="mt-1 mb-8 text-sm text-foreground-secondary">
        Daha önce koleksiyonerlere kavuşan {total} parça
      </p>

      <CollectionResults initialProducts={products} total={total} fixedParams={{ only: "sold" }} />
    </div>
  );
}

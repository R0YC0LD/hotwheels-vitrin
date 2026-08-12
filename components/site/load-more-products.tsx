"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/product-grid";
import type { ProductWithRelations } from "@/lib/types";

export function CollectionResults({
  initialProducts,
  total,
  fixedParams,
}: {
  initialProducts: ProductWithRelations[];
  total: number;
  fixedParams?: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const [products, setProducts] = React.useState(initialProducts);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
  }, [initialProducts]);

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page + 1));
      Object.entries(fixedParams ?? {}).forEach(([k, v]) => params.set(k, v));
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts((prev) => [...prev, ...data.products]);
      setPage((p) => p + 1);
    } catch {
      // sessizce yut — kullanıcı butona tekrar basabilir
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ProductGrid products={products} />
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" size="lg" onClick={loadMore} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Daha Fazla Göster ({products.length}/{total})
          </Button>
        </div>
      )}
    </div>
  );
}

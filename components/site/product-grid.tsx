import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import type { ProductWithRelations } from "@/lib/types";

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Bu filtrelere uygun bir parça bulunamadı."
        description="Farklı bir filtre kombinasyonu deneyebilir veya tüm filtreleri temizleyebilirsiniz."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-sm border border-border">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

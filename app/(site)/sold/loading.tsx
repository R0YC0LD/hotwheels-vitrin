import { ProductGridSkeleton } from "@/components/site/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-56" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}

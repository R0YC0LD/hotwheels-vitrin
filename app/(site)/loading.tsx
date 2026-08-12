import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/site/product-grid";

export default function Loading() {
  return (
    <div>
      <div className="border-b border-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-4 h-10 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-1/2 max-w-sm" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

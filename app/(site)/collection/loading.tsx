import { ProductGridSkeleton } from "@/components/site/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-24" />
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="hidden md:block">
          <Skeleton className="h-64 w-full" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}

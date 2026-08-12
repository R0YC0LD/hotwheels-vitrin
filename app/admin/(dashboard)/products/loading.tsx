import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-40" />
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

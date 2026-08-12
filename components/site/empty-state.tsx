import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border py-20 text-center",
        className
      )}
    >
      <PackageSearch className="size-8 text-foreground-muted" strokeWidth={1.25} />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-foreground-secondary">{description}</p>}
    </div>
  );
}

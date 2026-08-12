import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  hrefLabel = "Tümünü Gör",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-foreground-secondary">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm text-foreground-secondary transition-colors hover:text-accent"
        >
          {hrefLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

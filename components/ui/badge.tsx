import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-background-secondary text-foreground-secondary border border-border",
        accent: "bg-accent text-white",
        soft: "bg-accent-soft text-accent",
        sold: "bg-[#1c1c1f] text-foreground-muted border border-border",
        success: "bg-[#12271a] text-success border border-[#1f3d29]",
        rare: "bg-[#241318] text-accent border border-accent/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

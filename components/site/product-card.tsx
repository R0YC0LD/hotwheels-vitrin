import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { productImageUrl } from "@/lib/storage";
import type { ProductWithRelations } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.images.find((i) => i.is_cover) ?? product.images[0];
  const isSold = product.status === "sold" || product.stock <= 0;
  const hasSale = product.sale_price != null && product.sale_price < product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-foreground-secondary"
    >
      <div className="relative aspect-square overflow-hidden bg-background-secondary">
        {cover ? (
          <Image
            src={productImageUrl(cover.storage_path)}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-[1.03]",
              isSold && "grayscale brightness-50"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-foreground-muted">
            Görsel yok
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {isSold && <Badge variant="sold">Satıldı</Badge>}
          {product.rare && !isSold && <Badge variant="rare">Nadir</Badge>}
          {product.featured && !isSold && <Badge variant="soft">Öne Çıkan</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        </div>
        <p className="text-xs text-foreground-secondary">
          {[product.brand, product.series].filter(Boolean).join(" · ") || " "}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="text-sm font-semibold text-accent">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-xs text-foreground-muted line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-foreground-muted">
            {product.model_year ?? product.release_year ?? ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

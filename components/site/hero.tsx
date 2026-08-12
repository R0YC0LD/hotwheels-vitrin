import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/lib/storage";
import type { ProductWithRelations, SiteSettings } from "@/lib/types";

export function Hero({
  settings,
  heroProduct,
}: {
  settings: SiteSettings;
  heroProduct: ProductWithRelations | null;
}) {
  const cover = heroProduct?.images.find((i) => i.is_cover) ?? heroProduct?.images[0];

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
            Kişisel Koleksiyon
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {settings.hero_title}
          </h1>
          <p className="mt-4 max-w-md text-base text-foreground-secondary">
            {settings.hero_subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/collection">Koleksiyonu Keşfet</Link>
            </Button>
            {heroProduct && (
              <Button asChild size="lg" variant="secondary">
                <Link href={`/product/${heroProduct.slug}`}>Öne Çıkanı İncele</Link>
              </Button>
            )}
          </div>
        </div>

        {heroProduct && cover && (
          <Link
            href={`/product/${heroProduct.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-sm border border-border bg-card"
          >
            <Image
              src={productImageUrl(cover.storage_path)}
              alt={heroProduct.name}
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
              <div className="mb-2 flex gap-1.5">
                {heroProduct.rare && <Badge variant="rare">Nadir</Badge>}
              </div>
              <p className="text-base font-medium text-white">{heroProduct.name}</p>
              <p className="mt-1 text-sm text-white/80">
                {formatPrice(heroProduct.sale_price ?? heroProduct.price)}
              </p>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}

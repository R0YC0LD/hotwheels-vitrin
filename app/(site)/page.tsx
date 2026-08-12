import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductGrid } from "@/components/site/product-grid";
import { getSiteSettings } from "@/lib/db/settings";
import { getActiveCategories } from "@/lib/db/categories";
import {
  getFeaturedProducts,
  getNewArrivals,
  getProductById,
  getRareProducts,
  getRecentlySold,
} from "@/lib/db/products";
import { productImageUrl } from "@/lib/storage";

export default async function HomePage() {
  const settings = await getSiteSettings();

  const [newArrivals, featured, rare, categories, recentlySold, heroProduct] = await Promise.all([
    getNewArrivals(8),
    getFeaturedProducts(8),
    getRareProducts(8),
    getActiveCategories(),
    settings.show_sold_products ? getRecentlySold(8) : Promise.resolve([]),
    settings.hero_product_id ? getProductById(settings.hero_product_id) : Promise.resolve(null),
  ]);

  return (
    <div>
      <Hero settings={settings} heroProduct={heroProduct} />

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        {newArrivals.length > 0 && (
          <section>
            <SectionHeading
              title="Yeni Eklenenler"
              subtitle="Koleksiyona en son katılan parçalar"
              href="/collection?sort=newest"
            />
            <ProductGrid products={newArrivals} />
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <SectionHeading
              title="Öne Çıkanlar"
              subtitle="Özenle seçilmiş vitrin parçaları"
              href="/collection?sort=featured"
            />
            <ProductGrid products={featured} />
          </section>
        )}

        {rare.length > 0 && (
          <section>
            <SectionHeading
              title="Nadir Parçalar"
              subtitle="TH, STH ve Chase modeller"
              href="/collection?rare=true"
            />
            <ProductGrid products={rare} />
          </section>
        )}

        {categories.length > 0 && (
          <section>
            <SectionHeading title="Koleksiyonlar" href="/collection" hrefLabel="Tüm Kategoriler" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/collection?category=${category.slug}`}
                  className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-sm border border-border bg-card p-4"
                >
                  {category.image_path && (
                    <Image
                      src={productImageUrl(category.image_path)}
                      alt={category.name}
                      fill
                      sizes="25vw"
                      className="object-cover opacity-70 transition-opacity group-hover:opacity-90"
                    />
                  )}
                  <span className="relative z-10 text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recentlySold.length > 0 && (
          <section>
            <SectionHeading
              title="Son Satılanlar"
              subtitle="Koleksiyonerlere kavuşan parçalar"
              href="/sold"
            />
            <ProductGrid products={recentlySold} />
          </section>
        )}
      </div>
    </div>
  );
}

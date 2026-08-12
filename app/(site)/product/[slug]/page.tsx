import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductGallery } from "@/components/site/product-gallery";
import { AddToCartButton } from "@/components/site/add-to-cart-button";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductGrid } from "@/components/site/product-grid";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";
import { getSiteSettings } from "@/lib/db/settings";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/lib/storage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const cover = product.images.find((i) => i.is_cover) ?? product.images[0];
  const description =
    product.description?.slice(0, 160) ??
    `${product.brand ?? ""} ${product.series ?? ""} — ${formatPrice(product.price)}`.trim();

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: cover ? [{ url: productImageUrl(cover.storage_path) }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);

  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const isSold = product.status === "sold" || product.stock <= 0;
  const hasSale = product.sale_price != null && product.sale_price < product.price;

  const details = (
    [
      { label: "Marka", value: product.brand },
      { label: "Üretici", value: product.manufacturer },
      { label: "Model", value: product.model },
      { label: "Seri", value: product.series },
      { label: "Alt Seri", value: product.subseries },
      { label: "Model Yılı", value: product.model_year },
      { label: "Üretim Yılı", value: product.production_year },
      { label: "Çıkış Yılı", value: product.release_year },
      { label: "Ölçek", value: product.scale },
      { label: "Renk", value: product.color },
      { label: "Jant Tipi", value: product.wheel_type },
      { label: "Üretim Ülkesi", value: product.production_country },
      { label: "SKU", value: product.sku },
      { label: "Barkod", value: product.barcode },
    ] as { label: string; value: string | number | null | undefined }[]
  ).filter((d) => d.value !== null && d.value !== undefined && d.value !== "");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs text-foreground-muted">
        <Link href="/collection" className="hover:text-foreground-secondary">
          Koleksiyon
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/collection?category=${product.category.slug}`}
              className="hover:text-foreground-secondary"
            >
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} sold={isSold} />

        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {isSold && <Badge variant="sold">Satıldı</Badge>}
            {product.rare && <Badge variant="rare">Nadir</Badge>}
            {product.featured && <Badge variant="soft">Öne Çıkan</Badge>}
            {product.product_type && <Badge variant="default">{product.product_type.name}</Badge>}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {[product.brand, product.series, product.model_year].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            {hasSale ? (
              <>
                <span className="text-2xl font-semibold text-accent">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-base text-foreground-muted line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {isSold ? "Stokta yok" : `${product.stock} adet stokta`}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <AddToCartButton product={product} />
            {settings.whatsapp_number && !isSold && (
              <WhatsAppButton
                phoneNumber={settings.whatsapp_number}
                productName={product.name}
                sku={product.sku}
              />
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-2 text-xs text-foreground-secondary">
            {product.package_type && (
              <span className="rounded-sm border border-border px-2 py-1">
                {product.package_type === "carded"
                  ? "Kartlı"
                  : product.package_type === "loose"
                    ? "Kutusuz"
                    : "Açılmış"}
              </span>
            )}
            {product.condition && (
              <span className="rounded-sm border border-border px-2 py-1">{product.condition}</span>
            )}
            {product.card_condition && (
              <span className="rounded-sm border border-border px-2 py-1">
                Kart: {product.card_condition}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground-secondary">
              {product.description}
            </p>
          )}

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag.id} variant="default">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <Accordion type="single" collapsible className="mt-8">
            {details.length > 0 && (
              <AccordionItem value="details">
                <AccordionTrigger>Teknik Detaylar</AccordionTrigger>
                <AccordionContent>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {details.map(({ label, value }) => (
                      <div key={label} className="contents">
                        <dt className="text-foreground-muted">{label}</dt>
                        <dd className="text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            )}
            {(product.condition_notes || product.collector_note) && (
              <AccordionItem value="notes">
                <AccordionTrigger>Koleksiyoner Notu</AccordionTrigger>
                <AccordionContent className="space-y-2 text-foreground-secondary">
                  {product.condition_notes && <p>{product.condition_notes}</p>}
                  {product.collector_note && <p>{product.collector_note}</p>}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <SectionHeading title="Benzer Parçalar" />
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}

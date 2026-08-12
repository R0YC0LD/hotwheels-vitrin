import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { EmptyState } from "@/components/site/empty-state";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Medya" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const pageSize = 48;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("product_images")
    .select("*, product:products(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
        Medya <span className="text-foreground-muted">({count ?? 0})</span>
      </h1>
      <p className="mb-6 text-sm text-foreground-secondary">
        Cloud storage&apos;daki tüm ürün görselleri. Bir görseli silmek için ilgili ürünün
        düzenleme sayfasını kullanın — kırık bağlantı oluşmaması için silme burada yapılmaz.
      </p>

      {!data || data.length === 0 ? (
        <EmptyState title="Henüz görsel yüklenmemiş." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.map((img: any) => (
              <Link
                key={img.id}
                href={img.product ? `/admin/products/${img.product.id}/edit` : "#"}
                className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-background-secondary"
                title={img.product?.name}
              >
                <Image
                  src={productImageUrl(img.storage_path)}
                  alt={img.product?.name ?? ""}
                  fill
                  sizes="150px"
                  className="object-cover transition-opacity group-hover:opacity-75"
                />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/media?page=${i + 1}`}
                  className={
                    page === i + 1
                      ? "rounded-sm bg-accent px-3 py-1.5 text-white"
                      : "rounded-sm px-3 py-1.5 text-foreground-secondary hover:bg-background-secondary"
                  }
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

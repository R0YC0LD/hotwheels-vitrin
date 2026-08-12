import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";
import { ProductsToolbar } from "@/components/admin/products-toolbar";
import { QuickEditCell } from "@/components/admin/quick-edit-cell";
import { ProductActionsMenu } from "@/components/admin/product-actions-menu";
import { listAdminProducts } from "@/lib/db/admin/products";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Ürünler" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { products, total, pageSize, page } = await listAdminProducts(supabase, {
    search: sp.search,
    status: sp.status,
    page: sp.page ? Number(sp.page) : 1,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Ürünler <span className="text-foreground-muted">({total})</span>
        </h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <PlusCircle className="size-4" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      <ProductsToolbar />

      {products.length === 0 ? (
        <EmptyState
          title="İlk koleksiyon parçanı ekle."
          description="Bu filtrelere uygun ürün bulunamadı."
        />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-foreground-muted">
                <th className="p-3 font-medium">Ürün</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Fiyat</th>
                <th className="p-3 font-medium">Stok</th>
                <th className="p-3 font-medium">Kategori</th>
                <th className="p-3 font-medium">Durum</th>
                <th className="p-3 font-medium">Tarih</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {products.map((product: any) => {
                const cover =
                  product.images.find((i: { is_cover: boolean }) => i.is_cover) ?? product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-background-secondary/50">
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex items-center gap-3"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-background-secondary">
                          {cover && (
                            <Image
                              src={productImageUrl(cover.storage_path)}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="line-clamp-1 max-w-[220px] text-foreground">
                          {product.name}
                        </span>
                      </Link>
                    </td>
                    <td className="p-3 text-foreground-secondary">{product.sku ?? "—"}</td>
                    <td className="p-3">
                      <QuickEditCell
                        productId={product.id}
                        field="price"
                        value={Number(product.price)}
                        format="price"
                      />
                    </td>
                    <td className="p-3">
                      <QuickEditCell productId={product.id} field="stock" value={product.stock} />
                    </td>
                    <td className="p-3 text-foreground-secondary">{product.category?.name ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant={product.status === "sold" ? "sold" : "default"}>
                        {PRODUCT_STATUS_LABELS[product.status as keyof typeof PRODUCT_STATUS_LABELS]}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-foreground-muted">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="p-3 text-right">
                      <ProductActionsMenu product={product} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/products?page=${i + 1}${sp.search ? `&search=${sp.search}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
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
    </div>
  );
}

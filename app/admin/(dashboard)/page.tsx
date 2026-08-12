import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";
import { getDashboardStats } from "@/lib/db/admin/dashboard";
import { formatDate, formatPrice } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Toplam Ürün", value: stats.totalProducts },
    { label: "Satışta", value: stats.published },
    { label: "Satıldı", value: stats.sold },
    { label: "Taslak", value: stats.draft },
    { label: "Toplam Stok", value: stats.totalStock },
    { label: "Toplam Satış", value: formatPrice(stats.totalRevenue) },
    { label: "Bekleyen Sipariş", value: stats.pendingOrders },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="py-4">
              <p className="text-xs text-foreground-secondary">{card.label}</p>
              <p className="mt-1.5 text-2xl font-semibold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-medium text-foreground">Son Eklenen Ürünler</h2>
            </div>
            {stats.recentProducts.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="İlk koleksiyon parçanı ekle."
                  description="Henüz hiç ürün eklenmemiş."
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-background-secondary"
                  >
                    <span className="line-clamp-1 text-foreground">{p.name}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant="default">{PRODUCT_STATUS_LABELS[p.status as keyof typeof PRODUCT_STATUS_LABELS] ?? p.status}</Badge>
                      <span className="text-xs text-foreground-muted">{formatDate(p.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-medium text-foreground">Son Satılan Ürünler</h2>
            </div>
            {stats.recentSold.length === 0 ? (
              <div className="p-4">
                <EmptyState title="Henüz satılmış ürün yok." />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentSold.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-background-secondary"
                  >
                    <span className="line-clamp-1 text-foreground">{p.name}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-foreground-secondary">{formatPrice(p.price)}</span>
                      <span className="text-xs text-foreground-muted">
                        {p.sold_at ? formatDate(p.sold_at) : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

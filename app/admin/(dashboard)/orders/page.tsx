import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";
import { listOrders } from "@/lib/db/admin/orders";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Siparişler" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { orders, total } = await listOrders(supabase, { page: sp.page ? Number(sp.page) : 1 });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
        Siparişler <span className="text-foreground-muted">({total})</span>
      </h1>

      {orders.length === 0 ? (
        <EmptyState title="Henüz sipariş yok." />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-foreground-muted">
                <th className="p-3 font-medium">Sipariş No</th>
                <th className="p-3 font-medium">Müşteri</th>
                <th className="p-3 font-medium">Ürün</th>
                <th className="p-3 font-medium">Toplam</th>
                <th className="p-3 font-medium">Durum</th>
                <th className="p-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-background-secondary/50">
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="p-3 text-foreground-secondary">{order.customer_name}</td>
                  <td className="p-3 text-foreground-muted">{order.itemCount} ürün</td>
                  <td className="p-3 text-foreground">{formatPrice(order.total)}</td>
                  <td className="p-3">
                    <Badge variant="default">
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-foreground-muted">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

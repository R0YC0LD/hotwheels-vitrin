import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { getOrderById } from "@/lib/db/admin/orders";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Sipariş Detayı" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const order = await getOrderById(supabase, id);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {order.order_number}
          </h1>
          <p className="mt-1 text-xs text-foreground-muted">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusSelect order={order} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-1.5 py-4 text-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Müşteri
            </p>
            <p className="text-foreground">{order.customer_name}</p>
            <p className="text-foreground-secondary">{order.email}</p>
            <p className="text-foreground-secondary">{order.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1.5 py-4 text-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Teslimat Adresi
            </p>
            <p className="text-foreground-secondary">{order.address}</p>
            <p className="text-foreground-secondary">
              {[order.district, order.city].filter(Boolean).join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="border-b border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Ürünler
            </p>
          </div>
          <div className="divide-y divide-border">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-foreground">{item.product_name_snapshot}</span>
                <span className="text-foreground-secondary">
                  {item.quantity} × {formatPrice(item.price_snapshot)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between p-4 text-sm font-semibold">
            <span>Toplam</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

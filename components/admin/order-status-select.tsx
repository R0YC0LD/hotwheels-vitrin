"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types";

export function OrderStatusSelect({ order }: { order: Pick<Order, "id" | "status"> }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(order.status);
  const [saving, setSaving] = React.useState(false);

  async function onChange(value: string) {
    setSaving(true);
    const prev = status;
    setStatus(value as Order["status"]);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Sipariş durumu güncellenemedi.");
      setStatus(prev);
      return;
    }
    toast.success("Sipariş durumu güncellendi.");
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={saving}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

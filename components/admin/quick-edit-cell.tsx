"use client";

import * as React from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export function QuickEditCell({
  productId,
  field,
  value,
  format = "number",
}: {
  productId: string;
  field: "price" | "stock";
  value: number;
  format?: "price" | "number";
}) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(String(value));
  const [saving, setSaving] = React.useState(false);

  async function commit() {
    const num = Number(local);
    setEditing(false);
    if (Number.isNaN(num) || num < 0 || num === value) {
      setLocal(String(value));
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: num }),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error("Güncellenemedi.");
      setLocal(String(value));
    } else {
      toast.success("Güncellendi.");
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={local}
        disabled={saving}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setLocal(String(value));
            setEditing(false);
          }
        }}
        className="w-20 rounded-sm border border-accent bg-background-secondary px-1.5 py-0.5 text-sm text-foreground focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="rounded-sm px-1.5 py-0.5 text-sm text-foreground underline decoration-dotted underline-offset-4 hover:bg-background-secondary"
    >
      {format === "price" ? formatPrice(value) : value}
    </button>
  );
}

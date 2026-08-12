"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";

interface Item {
  id: string;
  name: string;
}

export function SimpleTaxonomyManager({
  initialItems,
  apiBase,
  emptyTitle,
  placeholder,
}: {
  initialItems: Item[];
  apiBase: string;
  emptyTitle: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (name.trim().length < 2) {
      toast.error("En az 2 karakter girin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const created = data.tag ?? data.productType;
      setItems((prev) => [...prev, created]);
      setName("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item) {
    const res = await fetch(`${apiBase}/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="max-w-xs"
        />
        <Button size="sm" onClick={add} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Ekle
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item.id} variant="default" className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs">
              {item.name}
              <button
                onClick={() => remove(item)}
                className="rounded-sm p-0.5 hover:bg-background-secondary hover:text-accent"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

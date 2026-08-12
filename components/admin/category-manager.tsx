"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/site/empty-state";
import type { Category } from "@/lib/types";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = React.useState(initialCategories);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setActive(true);
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setActive(category.active);
    setOpen(true);
  }

  async function save() {
    if (name.trim().length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalı.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev) =>
        editing
          ? prev.map((c) => (c.id === editing.id ? data.category : c))
          : [...prev, data.category]
      );
      setOpen(false);
      toast.success(editing ? "Kategori güncellendi." : "Kategori oluşturuldu.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: Category) {
    if (!confirm(`"${category.name}" kategorisini silmek istediğine emin misin?`)) return;
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Kategori silinemedi.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    toast.success("Kategori silindi.");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <PlusCircle className="size-4" />
              Yeni Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Kategoriyi Düzenle" : "Yeni Kategori"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">Ad</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">Açıklama</Label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Switch checked={active} onCheckedChange={setActive} />
                Aktif
              </label>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="Henüz kategori yok." description="İlk kategoriyi oluşturarak başla." />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-foreground-muted">
                <th className="p-3 font-medium">Ad</th>
                <th className="p-3 font-medium">Slug</th>
                <th className="p-3 font-medium">Durum</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-background-secondary/50">
                  <td className="p-3">
                    <button
                      onClick={() => openEdit(category)}
                      className="text-foreground hover:text-accent"
                    >
                      {category.name}
                    </button>
                  </td>
                  <td className="p-3 text-foreground-muted">{category.slug}</td>
                  <td className="p-3 text-foreground-secondary">
                    {category.active ? "Aktif" : "Pasif"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => remove(category)}
                      className="rounded-sm p-1.5 text-foreground-secondary hover:bg-background-secondary hover:text-accent"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

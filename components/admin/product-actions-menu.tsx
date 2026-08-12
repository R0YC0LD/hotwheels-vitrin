"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function ProductActionsMenu({
  product,
  onChanged,
}: {
  product: Pick<Product, "id" | "slug" | "status" | "name">;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function patchStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Ürün güncellendi.");
      onChanged?.();
      router.refresh();
    } catch {
      toast.error("İşlem başarısız oldu.");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      toast.success("Ürün çoğaltıldı.");
      router.push(`/admin/products/${data.product.id}/edit`);
      router.refresh();
    } catch {
      toast.error("Ürün çoğaltılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Ürün silindi.");
      setConfirmOpen(false);
      onChanged?.();
      router.refresh();
    } catch {
      toast.error("Ürün silinemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-sm p-1.5 text-foreground-secondary hover:bg-background-secondary hover:text-foreground">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Pencil className="size-3.5" /> Düzenle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/product/${product.slug}`} target="_blank">
              <Eye className="size-3.5" /> Önizle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={duplicate} disabled={busy}>
            <Copy className="size-3.5" /> Çoğalt
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {product.status !== "sold" && (
            <DropdownMenuItem onClick={() => patchStatus("sold")} disabled={busy}>
              <Tag className="size-3.5" /> Satıldı Yap
            </DropdownMenuItem>
          )}
          {product.status === "published" ? (
            <DropdownMenuItem onClick={() => patchStatus("hidden")} disabled={busy}>
              <EyeOff className="size-3.5" /> Yayından Kaldır
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => patchStatus("published")} disabled={busy}>
              <Eye className="size-3.5" /> Yayınla
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-3.5" /> Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü Sil</DialogTitle>
            <DialogDescription>
              &quot;{product.name}&quot; ürününü kalıcı olarak silmek istediğine emin misin? Bu
              ürün koleksiyon arşivinden kaldırılacak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={remove} disabled={busy}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

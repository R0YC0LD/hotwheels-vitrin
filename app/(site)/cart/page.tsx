"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { useCart } from "@/components/site/cart-provider";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, removeItem, isReady } = useCart();

  if (!isReady) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sepetiniz boş."
          description="Koleksiyonu inceleyip beğendiğiniz parçaları sepete ekleyebilirsiniz."
        />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/collection">Koleksiyonu Keşfet</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Sepet</h1>
      <p className="mt-1 mb-8 text-sm text-foreground-secondary">{items.length} ürün</p>

      <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-background-secondary">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${item.slug}`}
                className="line-clamp-1 text-sm font-medium text-foreground hover:text-accent"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-foreground-secondary">{formatPrice(item.price)}</p>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="p-2 text-foreground-muted hover:text-accent"
              aria-label="Sepetten çıkar"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
        <span className="text-sm text-foreground-secondary">Ara Toplam</span>
        <span className="text-lg font-semibold text-foreground">{formatPrice(subtotal)}</span>
      </div>

      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/checkout">Siparişi Tamamla</Link>
      </Button>
    </div>
  );
}

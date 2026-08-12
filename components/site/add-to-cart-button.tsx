"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart-provider";
import type { ProductWithRelations } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";

export function AddToCartButton({ product }: { product: ProductWithRelations }) {
  const { addItem, isInCart, isReady } = useCart();
  const router = useRouter();
  const cover = product.images.find((i) => i.is_cover) ?? product.images[0];
  const inCart = isReady && isInCart(product.id);
  const isSold = product.status === "sold" || product.stock <= 0;

  if (isSold) {
    return (
      <Button size="lg" className="w-full" disabled variant="secondary">
        Satıldı
      </Button>
    );
  }

  if (inCart) {
    return (
      <Button size="lg" className="w-full" variant="secondary" onClick={() => router.push("/cart")}>
        <Check className="size-4" />
        Sepette — Sepete Git
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={!isReady}
      onClick={() =>
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.sale_price ?? product.price,
          image: cover ? productImageUrl(cover.storage_path) : null,
          stock: product.stock,
        })
      }
    >
      <ShoppingBag className="size-4" />
      Sepete Ekle
    </Button>
  );
}

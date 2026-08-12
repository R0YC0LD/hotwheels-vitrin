"use client";

import * as React from "react";
import { toast } from "sonner";
import { CART_STORAGE_KEY, type CartItem } from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isInCart: (productId: string) => boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  isReady: boolean;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupted local storage — start with an empty cart
    }
    setIsReady(true);
  }, []);

  React.useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  const isInCart = React.useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const addItem = React.useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        toast.info("Bu ürün zaten sepetinizde.");
        return prev;
      }
      toast.success(`${item.name} sepete eklendi.`);
      return [...prev, item];
    });
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{ items, count: items.length, subtotal, isInCart, addItem, removeItem, clear, isReady }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

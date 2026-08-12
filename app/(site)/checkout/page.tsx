"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/site/empty-state";
import { useCart } from "@/components/site/cart-provider";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/order";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, clear, isReady } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutFormSchema) });

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          district: values.district,
          items: items.map((i) => ({ productId: i.productId, quantity: 1 })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Sipariş oluşturulamadı. Tekrar deneyin.");
        return;
      }

      clear();
      router.push(`/checkout/success?number=${encodeURIComponent(data.order.order_number)}`);
    } catch {
      toast.error("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isReady) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sepetiniz boş."
          description="Sipariş oluşturmak için önce sepetinize ürün eklemelisiniz."
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
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Sipariş Bilgileri
      </h1>
      <p className="mt-1 mb-8 text-sm text-foreground-secondary">
        Bu ilk sürümde ödeme entegrasyonu bulunmuyor — siparişiniz &quot;ödeme bekleniyor&quot;
        durumunda oluşturulur, ödeme detayları için sizinle iletişime geçilir.
      </p>

      <div className="grid gap-10 md:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="customerName" className="mb-1.5 block">
              Ad Soyad
            </Label>
            <Input id="customerName" {...register("customerName")} />
            {errors.customerName && (
              <p className="mt-1 text-xs text-accent">{errors.customerName.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                E-posta
              </Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-accent">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">
                Telefon
              </Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-accent">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="mb-1.5 block">
              Adres
            </Label>
            <Textarea id="address" rows={3} {...register("address")} />
            {errors.address && <p className="mt-1 text-xs text-accent">{errors.address.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city" className="mb-1.5 block">
                Şehir
              </Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="mt-1 text-xs text-accent">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="district" className="mb-1.5 block">
                İlçe (opsiyonel)
              </Label>
              <Input id="district" {...register("district")} />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Siparişi Onayla
          </Button>
        </form>

        <div className="h-fit rounded-sm border border-border p-4">
          <h2 className="mb-3 text-sm font-medium text-foreground">Sipariş Özeti</h2>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="line-clamp-1 text-foreground-secondary">{item.name}</span>
                <span className="shrink-0 text-foreground">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
            <span>Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

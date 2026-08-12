"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteSettingsFormSchema, type SiteSettingsFormValues } from "@/lib/validation/settings";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({
  settings,
  productOptions,
}: {
  settings: SiteSettings;
  productOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema) as Resolver<SiteSettingsFormValues>,
    defaultValues: {
      site_name: settings.site_name,
      logo_url: settings.logo_url ?? "",
      favicon_url: settings.favicon_url ?? "",
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_product_id: settings.hero_product_id ?? "",
      instagram_url: settings.instagram_url ?? "",
      whatsapp_number: settings.whatsapp_number ?? "",
      contact_email: settings.contact_email ?? "",
      shipping_note: settings.shipping_note ?? "",
      footer_text: settings.footer_text ?? "",
      show_sold_products: settings.show_sold_products,
    },
  });

  async function onSubmit(values: SiteSettingsFormValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Ayarlar kaydedildi.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-6">
      <section className="grid gap-4">
        <h2 className="text-sm font-medium text-foreground">Genel</h2>
        <div>
          <Label htmlFor="site_name" className="mb-1.5 block">
            Site Adı
          </Label>
          <Input id="site_name" {...register("site_name")} />
          {errors.site_name && <p className="mt-1 text-xs text-accent">{errors.site_name.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="logo_url" className="mb-1.5 block">
              Logo URL
            </Label>
            <Input id="logo_url" {...register("logo_url")} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="favicon_url" className="mb-1.5 block">
              Favicon URL
            </Label>
            <Input id="favicon_url" {...register("favicon_url")} placeholder="https://..." />
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-medium text-foreground">Hero</h2>
        <div>
          <Label htmlFor="hero_title" className="mb-1.5 block">
            Hero Başlığı
          </Label>
          <Input id="hero_title" {...register("hero_title")} />
        </div>
        <div>
          <Label htmlFor="hero_subtitle" className="mb-1.5 block">
            Hero Açıklaması
          </Label>
          <Textarea id="hero_subtitle" rows={2} {...register("hero_subtitle")} />
        </div>
        <div>
          <Label className="mb-1.5 block">Hero Ürünü</Label>
          <Controller
            control={control}
            name="hero_product_id"
            render={({ field }) => (
              <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {productOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-medium text-foreground">İletişim</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="whatsapp_number" className="mb-1.5 block">
              WhatsApp Numarası
            </Label>
            <Input id="whatsapp_number" {...register("whatsapp_number")} placeholder="+90 5xx xxx xx xx" />
          </div>
          <div>
            <Label htmlFor="contact_email" className="mb-1.5 block">
              İletişim E-postası
            </Label>
            <Input id="contact_email" type="email" {...register("contact_email")} />
          </div>
        </div>
        <div>
          <Label htmlFor="instagram_url" className="mb-1.5 block">
            Instagram Linki
          </Label>
          <Input id="instagram_url" {...register("instagram_url")} placeholder="https://instagram.com/..." />
        </div>
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-medium text-foreground">İçerik</h2>
        <div>
          <Label htmlFor="shipping_note" className="mb-1.5 block">
            Kargo Açıklaması
          </Label>
          <Textarea id="shipping_note" rows={2} {...register("shipping_note")} />
        </div>
        <div>
          <Label htmlFor="footer_text" className="mb-1.5 block">
            Footer Metni
          </Label>
          <Textarea id="footer_text" rows={2} {...register("footer_text")} />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Controller
            control={control}
            name="show_sold_products"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
          Satılmış ürünleri sitede göster
        </label>
      </section>

      <Button type="submit" size="lg" className="w-fit" disabled={saving}>
        {saving && <Loader2 className="size-4 animate-spin" />}
        Kaydet
      </Button>
    </form>
  );
}

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  productFormSchema,
  type ProductFormValues,
  PACKAGE_TYPES,
  CONDITIONS,
  CARD_CONDITIONS,
} from "@/lib/validation/product";
import type { Category, ProductType, Tag, ProductWithRelations } from "@/lib/types";

interface Props {
  mode: "new" | "edit";
  product?: ProductWithRelations;
  categories: Category[];
  productTypes: ProductType[];
  tags: Tag[];
}

const DRAFT_PLACEHOLDER_NAME = "Yeni Ürün";

function toDefaultValues(product?: ProductWithRelations): Partial<ProductFormValues> {
  if (!product) {
    return { name: "", price: 0, stock: 1, status: "draft", active: true, tagIds: [] };
  }
  return {
    name: product.name === DRAFT_PLACEHOLDER_NAME ? "" : product.name,
    brand: product.brand ?? undefined,
    manufacturer: product.manufacturer ?? undefined,
    model: product.model ?? undefined,
    series: product.series ?? undefined,
    subseries: product.subseries ?? undefined,
    category_id: product.category_id ?? undefined,
    product_type_id: product.product_type_id ?? undefined,
    model_year: product.model_year ?? undefined,
    production_year: product.production_year ?? undefined,
    release_year: product.release_year ?? undefined,
    scale: product.scale ?? undefined,
    color: product.color ?? undefined,
    wheel_type: product.wheel_type ?? undefined,
    production_country: product.production_country ?? undefined,
    package_type: product.package_type ?? undefined,
    condition: product.condition ?? undefined,
    card_condition: product.card_condition ?? undefined,
    condition_notes: product.condition_notes ?? undefined,
    price: Number(product.price),
    sale_price: product.sale_price ? Number(product.sale_price) : undefined,
    stock: product.stock,
    status: product.status,
    featured: product.featured,
    rare: product.rare,
    active: product.active,
    description: product.description ?? undefined,
    collector_note: product.collector_note ?? undefined,
    sku: product.sku ?? undefined,
    barcode: product.barcode ?? undefined,
    tagIds: product.tags.map((t) => t.id),
  };
}

export function ProductForm({ mode, product, categories, productTypes, tags }: Props) {
  const router = useRouter();
  const [draftId, setDraftId] = React.useState<string | null>(product?.id ?? null);
  const [draftImages, setDraftImages] = React.useState(product?.images ?? []);
  const [creating, setCreating] = React.useState(mode === "new");
  const [saving, setSaving] = React.useState<"draft" | "publish" | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues: toDefaultValues(product),
  });

  React.useEffect(() => {
    if (mode !== "new" || draftId) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: DRAFT_PLACEHOLDER_NAME, price: 0, stock: 1, status: "draft" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDraftId(data.product.id);
        setDraftImages([]);
      } catch {
        toast.error("Taslak oluşturulamadı. Sayfayı yenileyip tekrar deneyin.");
      } finally {
        setCreating(false);
      }
    })();
  }, [mode, draftId]);

  const selectedTagIds = watch("tagIds") ?? [];

  async function save(values: ProductFormValues, status: "draft" | "published") {
    if (!draftId) return;
    setSaving(status === "published" ? "publish" : "draft");
    try {
      const res = await fetch(`/api/admin/products/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");

      toast.success(status === "published" ? "Ürün yayınlandı." : "Taslak kaydedildi.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(null);
    }
  }

  if (creating || !draftId) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Hazırlanıyor...
      </div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_320px]" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-6">
        <section>
          <Label className="mb-2 block">Fotoğraflar</Label>
          <ImageUploader productId={draftId} initialImages={draftImages} />
        </section>

        <section className="grid gap-4">
          <div>
            <Label htmlFor="name" className="mb-1.5 block">
              Ürün Adı
            </Label>
            <Input id="name" {...register("name")} placeholder="Örn. Nissan Skyline GT-R R34" />
            {errors.name && <p className="mt-1 text-xs text-accent">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="brand" className="mb-1.5 block">
                Marka
              </Label>
              <Input id="brand" {...register("brand")} />
            </div>
            <div>
              <Label htmlFor="model" className="mb-1.5 block">
                Model
              </Label>
              <Input id="model" {...register("model")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="series" className="mb-1.5 block">
                Seri
              </Label>
              <Input id="series" {...register("series")} placeholder="Örn. Hot Wheels Premium" />
            </div>
            <div>
              <Label htmlFor="model_year" className="mb-1.5 block">
                Yıl
              </Label>
              <Input id="model_year" type="number" {...register("model_year")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Kondisyon</Label>
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Paket</Label>
              <Controller
                control={control}
                name="package_type"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGE_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p === "carded" ? "Kartlı" : p === "loose" ? "Kutusuz" : "Açılmış"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price" className="mb-1.5 block">
                Fiyat (₺)
              </Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-accent">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="stock" className="mb-1.5 block">
                Stok
              </Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="mt-1 text-xs text-accent">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-1.5 block">
              Açıklama
            </Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>
        </section>

        <Accordion type="single" collapsible>
          <AccordionItem value="more">
            <AccordionTrigger>Daha Fazla Detay</AccordionTrigger>
            <AccordionContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="manufacturer" className="mb-1.5 block">
                    Üretici
                  </Label>
                  <Input id="manufacturer" {...register("manufacturer")} />
                </div>
                <div>
                  <Label htmlFor="subseries" className="mb-1.5 block">
                    Alt Seri
                  </Label>
                  <Input id="subseries" {...register("subseries")} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="production_year" className="mb-1.5 block">
                    Üretim Yılı
                  </Label>
                  <Input id="production_year" type="number" {...register("production_year")} />
                </div>
                <div>
                  <Label htmlFor="release_year" className="mb-1.5 block">
                    Çıkış Yılı
                  </Label>
                  <Input id="release_year" type="number" {...register("release_year")} />
                </div>
                <div>
                  <Label htmlFor="scale" className="mb-1.5 block">
                    Ölçek
                  </Label>
                  <Input id="scale" placeholder="1:64" {...register("scale")} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="color" className="mb-1.5 block">
                    Renk
                  </Label>
                  <Input id="color" {...register("color")} />
                </div>
                <div>
                  <Label htmlFor="wheel_type" className="mb-1.5 block">
                    Jant Tipi
                  </Label>
                  <Input id="wheel_type" {...register("wheel_type")} />
                </div>
                <div>
                  <Label htmlFor="production_country" className="mb-1.5 block">
                    Üretim Ülkesi
                  </Label>
                  <Input id="production_country" {...register("production_country")} />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Kart Kondisyonu</Label>
                <Controller
                  control={control}
                  name="card_condition"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARD_CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="condition_notes" className="mb-1.5 block">
                  Kondisyon Notu
                </Label>
                <Textarea id="condition_notes" rows={2} {...register("condition_notes")} />
              </div>
              <div>
                <Label htmlFor="collector_note" className="mb-1.5 block">
                  Koleksiyoner Notu
                </Label>
                <Textarea id="collector_note" rows={2} {...register("collector_note")} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sale_price" className="mb-1.5 block">
                    İndirimli Fiyat (₺)
                  </Label>
                  <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} />
                </div>
                <div>
                  <Label htmlFor="sku" className="mb-1.5 block">
                    SKU
                  </Label>
                  <Input id="sku" {...register("sku")} />
                </div>
              </div>
              <div>
                <Label htmlFor="barcode" className="mb-1.5 block">
                  Barkod
                </Label>
                <Input id="barcode" {...register("barcode")} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <aside className="flex h-fit flex-col gap-5 rounded-sm border border-border p-4">
        <div>
          <Label className="mb-1.5 block">Kategori</Label>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label className="mb-1.5 block">Ürün Tipi</Label>
          <Controller
            control={control}
            name="product_type_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {tags.length > 0 && (
          <div>
            <Label className="mb-2 block">Etiketler</Label>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      setValue(
                        "tagIds",
                        checked
                          ? [...selectedTagIds, tag.id]
                          : selectedTagIds.filter((id) => id !== tag.id)
                      );
                    }}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Öne Çıkan
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Controller
              control={control}
              name="rare"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Nadir / TH / STH / Chase
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={saving !== null}
            onClick={handleSubmit((values) => save(values, "draft"))}
          >
            {saving === "draft" && <Loader2 className="size-4 animate-spin" />}
            Taslak Kaydet
          </Button>
          <Button
            type="button"
            disabled={saving !== null}
            onClick={handleSubmit((values) => save(values, "published"))}
          >
            {saving === "publish" && <Loader2 className="size-4 animate-spin" />}
            Yayınla
          </Button>
        </div>
      </aside>
    </form>
  );
}

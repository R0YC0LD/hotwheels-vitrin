"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Category, ProductType } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
  { value: "price_asc", label: "Fiyat Artan" },
  { value: "price_desc", label: "Fiyat Azalan" },
  { value: "featured", label: "Öne Çıkanlar" },
];

const CONDITIONS = ["Mint", "Near Mint", "Very Good", "Good", "Used"];
const PACKAGE_TYPES = [
  { value: "carded", label: "Kartlı (Carded)" },
  { value: "loose", label: "Kutusuz (Loose)" },
  { value: "opened", label: "Açılmış" },
];

interface Props {
  categories: Category[];
  productTypes: ProductType[];
}

export function CollectionFilters({ categories, productTypes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const activeCount = Array.from(searchParams.keys()).filter((k) => k !== "sort").length;

  const body = (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="mb-2 block">Kategori</Label>
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Ürün Tipi</Label>
        <Select
          value={searchParams.get("type") ?? "all"}
          onValueChange={(v) => updateParam("type", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {productTypes.map((t) => (
              <SelectItem key={t.id} value={t.slug}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Kondisyon</Label>
        <Select
          value={searchParams.get("condition") ?? "all"}
          onValueChange={(v) => updateParam("condition", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Paket</Label>
        <Select
          value={searchParams.get("package") ?? "all"}
          onValueChange={(v) => updateParam("package", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {PACKAGE_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Fiyat Aralığı (₺)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParam("minPrice", e.target.value || null)}
          />
          <span className="text-foreground-muted">–</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={searchParams.get("rare") === "true"}
            onCheckedChange={(v) => updateParam("rare", v ? "true" : null)}
          />
          Sadece Nadir / TH / STH
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={searchParams.get("inStock") === "true"}
            onCheckedChange={(v) => updateParam("inStock", v ? "true" : null)}
          />
          Sadece Stokta Olanlar
        </label>
      </div>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="justify-start">
          <X className="size-3.5" />
          Filtreleri Temizle
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground-secondary">
          Filtreler
        </h3>
        {body}
      </div>

      <div className="flex items-center gap-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm">
              <SlidersHorizontal className="size-3.5" />
              Filtreler {activeCount > 0 && `(${activeCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="overflow-y-auto">
            <SheetTitle>Filtreler</SheetTitle>
            <div className="mt-4">{body}</div>
          </SheetContent>
        </Sheet>

        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(v) => updateParam("sort", v)}
        >
          <SelectTrigger className="w-auto flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      value={searchParams.get("sort") ?? "newest"}
      onValueChange={(v) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", v);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

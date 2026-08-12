import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().optional()
);

export const PACKAGE_TYPES = ["carded", "loose", "opened"] as const;
export const CONDITIONS = ["Mint", "Near Mint", "Very Good", "Good", "Used"] as const;
export const CARD_CONDITIONS = [
  "Mint",
  "Minor Wear",
  "Soft Corners",
  "Creased",
  "Damaged",
] as const;
export const PRODUCT_STATUSES = ["draft", "published", "sold", "hidden"] as const;

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı"),
  brand: optionalString,
  manufacturer: optionalString,
  model: optionalString,
  series: optionalString,
  subseries: optionalString,
  category_id: optionalString,
  product_type_id: optionalString,

  model_year: optionalInt,
  production_year: optionalInt,
  release_year: optionalInt,

  scale: optionalString,
  color: optionalString,
  wheel_type: optionalString,
  production_country: optionalString,

  package_type: z.preprocess(emptyToUndefined, z.enum(PACKAGE_TYPES).optional()),
  condition: z.preprocess(emptyToUndefined, z.enum(CONDITIONS).optional()),
  card_condition: z.preprocess(emptyToUndefined, z.enum(CARD_CONDITIONS).optional()),
  condition_notes: optionalString,

  price: z.coerce.number().min(0, "Fiyat negatif olamaz"),
  sale_price: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0, "İndirimli fiyat negatif olamaz").optional()
  ),
  stock: z.coerce.number().int().min(0, "Stok negatif olamaz").default(1),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  rare: z.boolean().default(false),
  active: z.boolean().default(true),

  description: optionalString,
  collector_note: optionalString,

  sku: optionalString,
  barcode: optionalString,

  tagIds: z.array(z.string().uuid()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const quickEditSchema = z.object({
  price: z.coerce.number().min(0).optional(),
  sale_price: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  stock: z.coerce.number().int().min(0).optional(),
});

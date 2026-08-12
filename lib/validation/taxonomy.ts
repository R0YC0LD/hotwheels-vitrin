import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalı"),
  description: z.string().trim().optional().or(z.literal("")),
  active: z.boolean().default(true),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const tagFormSchema = z.object({
  name: z.string().trim().min(2, "Etiket adı en az 2 karakter olmalı"),
});
export type TagFormValues = z.infer<typeof tagFormSchema>;

export const productTypeFormSchema = z.object({
  name: z.string().trim().min(2, "Ürün tipi adı en az 2 karakter olmalı"),
});
export type ProductTypeFormValues = z.infer<typeof productTypeFormSchema>;

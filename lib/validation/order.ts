import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalı"),
  email: z.string().trim().email("Geçerli bir e-posta girin"),
  phone: z.string().trim().min(10, "Geçerli bir telefon numarası girin"),
  address: z.string().trim().min(10, "Adres en az 10 karakter olmalı"),
  city: z.string().trim().min(2, "Şehir girin"),
  district: z.string().trim().optional().or(z.literal("")),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const createOrderRequestSchema = z.object({
  customerName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10),
  address: z.string().trim().min(10),
  city: z.string().trim().min(2),
  district: z.string().trim().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(1),
      })
    )
    .min(1, "Sepet boş"),
});

import { z } from "zod";

const nullableString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const siteSettingsFormSchema = z.object({
  site_name: z.string().trim().min(1, "Site adı gerekli"),
  logo_url: nullableString,
  favicon_url: nullableString,
  hero_title: z.string().trim().min(1),
  hero_subtitle: z.string().trim().optional().default(""),
  hero_product_id: nullableString,
  instagram_url: nullableString,
  whatsapp_number: nullableString,
  contact_email: nullableString,
  shipping_note: nullableString,
  footer_text: nullableString,
  show_sold_products: z.boolean().default(true),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

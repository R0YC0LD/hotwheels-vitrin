import { createBrowserClient } from "@supabase/ssr";

// Not: Database generic'i bilinçli olarak burada uygulanmıyor — supabase-js'in
// embed (nested select) tip çözümleyicisi elle yazılmış Database tipiyle
// uyuşmayınca tüm sorgular `never`e düşüyor. Domain tipleri lib/types.ts
// üzerinden (Product, Category, ...) sorgu fonksiyonlarında elle uygulanıyor.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

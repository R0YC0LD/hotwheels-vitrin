import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Public, cookie'siz, RLS'e tabi (anon) client. Server component'lerde
 * ziyaretçi tarafındaki okuma sorguları için kullanılır. `cache: "no-store"`
 * ile her istek DB'den taze veri çeker — admin panelinden yapılan bir
 * değişiklik yeniden deploy gerekmeden anında yansır.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    }
  );
}

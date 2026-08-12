import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("site_settings").select("key, value");

    if (!data) return DEFAULT_SITE_SETTINGS;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return { ...DEFAULT_SITE_SETTINGS, ...map } as SiteSettings;
  } catch {
    // Supabase erişilemezse site ayarları olmadan da temel iskelet çalışsın.
    return DEFAULT_SITE_SETTINGS;
  }
}

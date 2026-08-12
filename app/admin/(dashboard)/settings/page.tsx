import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/db/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Site Ayarları" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [settings, { data: products }] = await Promise.all([
    getSiteSettings(),
    supabase
      .from("products")
      .select("id, name")
      .is("deleted_at", null)
      .eq("status", "published")
      .order("name")
      .limit(200),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">Site Ayarları</h1>
      <SettingsForm settings={settings} productOptions={products ?? []} />
    </div>
  );
}

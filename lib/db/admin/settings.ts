/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

export async function updateSiteSettings(
  supabase: any,
  adminId: string,
  values: Record<string, unknown>
) {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value: value ?? null }));

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;

  await supabase
    .from("activity_logs")
    .insert({ admin_id: adminId, action: "settings_updated", entity: "site_settings", metadata: values });
}

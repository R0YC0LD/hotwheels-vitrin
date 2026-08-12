import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin guard. Middleware zaten /admin/* rotalarını korur, ancak
 * middleware bypass edilse bile bu katman aynı kontrolü tekrar uygular
 * (route/API seviyesinde savunma derinliği).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return { user, profile: profile as { id: string; email: string; role: "admin" | "customer" } };
}

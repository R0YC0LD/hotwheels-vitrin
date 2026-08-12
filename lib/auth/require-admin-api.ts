import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route handler admin guard. Middleware ve requireAdmin() sayfa seviyesinde
 * koruma sağlar; bu fonksiyon aynı kontrolü API route'ları için (redirect
 * yerine JSON 401/403 döndürerek) tekrar uygular.
 */
export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 }) };
  }

  return { user, profile: profile as { id: string; email: string; role: "admin" }, supabase };
}

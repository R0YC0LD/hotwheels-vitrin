import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { updateSiteSettings } from "@/lib/db/admin/settings";
import { siteSettingsFormSchema } from "@/lib/validation/settings";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Girdiğiniz bilgileri kontrol edin.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await updateSiteSettings(auth.supabase, auth.user.id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ayarlar kaydedilemedi." }, { status: 500 });
  }
}

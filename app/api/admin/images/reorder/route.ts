import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const orderedIds: string[] | undefined = body?.orderedIds;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      auth.supabase.from("product_images").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/products");
  return NextResponse.json({ ok: true });
}

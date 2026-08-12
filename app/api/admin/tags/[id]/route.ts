import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteTag } from "@/lib/db/admin/taxonomy";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await deleteTag(auth.supabase, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Etiket silinemedi." }, { status: 500 });
  }
}

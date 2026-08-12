import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createTag } from "@/lib/db/admin/taxonomy";
import { tagFormSchema } from "@/lib/validation/taxonomy";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = tagFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Etiket adı en az 2 karakter olmalı." }, { status: 400 });
  }

  try {
    const tag = await createTag(auth.supabase, parsed.data.name);
    return NextResponse.json({ tag });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Etiket oluşturulamadı." }, { status: 500 });
  }
}

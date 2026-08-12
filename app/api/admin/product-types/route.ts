import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createProductType } from "@/lib/db/admin/taxonomy";
import { productTypeFormSchema } from "@/lib/validation/taxonomy";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = productTypeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ürün tipi adı en az 2 karakter olmalı." }, { status: 400 });
  }

  try {
    const productType = await createProductType(auth.supabase, parsed.data.name);
    return NextResponse.json({ productType });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün tipi oluşturulamadı." }, { status: 500 });
  }
}

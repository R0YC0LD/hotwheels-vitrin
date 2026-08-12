import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createCategory } from "@/lib/db/admin/taxonomy";
import { categoryFormSchema } from "@/lib/validation/taxonomy";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = categoryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Girdiğiniz bilgileri kontrol edin." }, { status: 400 });
  }

  try {
    const category = await createCategory(auth.supabase, parsed.data);
    revalidatePath("/");
    revalidatePath("/collection");
    return NextResponse.json({ category });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategori oluşturulamadı." }, { status: 500 });
  }
}

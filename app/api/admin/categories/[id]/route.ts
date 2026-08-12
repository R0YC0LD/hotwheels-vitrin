import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteCategory, updateCategory } from "@/lib/db/admin/taxonomy";
import { categoryFormSchema } from "@/lib/validation/taxonomy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = categoryFormSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Girdiğiniz bilgileri kontrol edin." }, { status: 400 });
  }

  try {
    const category = await updateCategory(auth.supabase, id, parsed.data);
    revalidatePath("/");
    revalidatePath("/collection");
    return NextResponse.json({ category });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategori güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await deleteCategory(auth.supabase, id);
    revalidatePath("/");
    revalidatePath("/collection");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategori silinemedi." }, { status: 500 });
  }
}

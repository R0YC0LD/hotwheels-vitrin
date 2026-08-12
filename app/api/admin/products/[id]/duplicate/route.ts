import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { duplicateProduct } from "@/lib/db/admin/products";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    const product = await duplicateProduct(auth.supabase, auth.user.id, id);
    revalidatePath("/admin/products");
    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün çoğaltılamadı." }, { status: 500 });
  }
}

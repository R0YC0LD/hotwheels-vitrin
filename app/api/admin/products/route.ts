import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createProduct } from "@/lib/db/admin/products";
import { productFormSchema } from "@/lib/validation/product";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = productFormSchema.partial({ status: true, stock: true }).safeParse(body);

  if (!parsed.success || !parsed.data.name || parsed.data.price === undefined) {
    return NextResponse.json(
      { error: "Ürün adı ve fiyat zorunludur.", issues: parsed.success ? null : parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(auth.supabase, auth.user.id, {
      ...parsed.data,
      name: parsed.data.name,
      price: parsed.data.price,
      status: parsed.data.status ?? "draft",
      stock: parsed.data.stock ?? 1,
    });

    revalidatePath("/");
    revalidatePath("/collection");

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün oluşturulamadı." }, { status: 500 });
  }
}

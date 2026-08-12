import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { setProductStatus, softDeleteProduct, updateProduct } from "@/lib/db/admin/products";
import { productFormSchema, PRODUCT_STATUSES } from "@/lib/validation/product";

function revalidatePublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/sold");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  try {
    const keys = Object.keys(body);
    if (keys.length === 1 && keys[0] === "status" && PRODUCT_STATUSES.includes(body.status)) {
      const product = await setProductStatus(auth.supabase, auth.user.id, id, body.status);
      revalidatePublicPages(product.slug);
      return NextResponse.json({ product });
    }

    const parsed = productFormSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Girdiğiniz bilgileri kontrol edin.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await updateProduct(auth.supabase, auth.user.id, id, parsed.data);
    revalidatePublicPages(product.slug);
    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await softDeleteProduct(auth.supabase, auth.user.id, id);
    revalidatePublicPages();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
  }
}

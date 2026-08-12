import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body || body.isCover !== true) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { data: image } = await auth.supabase
    .from("product_images")
    .select("product_id")
    .eq("id", id)
    .single();

  if (!image) return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 404 });

  await auth.supabase.from("product_images").update({ is_cover: false }).eq("product_id", image.product_id);
  const { error } = await auth.supabase.from("product_images").update({ is_cover: true }).eq("id", id);

  if (error) return NextResponse.json({ error: "Kapak görseli ayarlanamadı." }, { status: 500 });

  revalidatePath("/admin/products");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const { data: image } = await auth.supabase
    .from("product_images")
    .select("storage_path, product_id, is_cover")
    .eq("id", id)
    .single();

  if (!image) return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 404 });

  const { error: deleteError } = await auth.supabase.from("product_images").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Görsel silinemedi." }, { status: 500 });

  const adminClient = createAdminClient();
  await adminClient.storage.from("product-images").remove([image.storage_path]);

  if (image.is_cover) {
    const { data: next } = await auth.supabase
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await auth.supabase.from("product_images").update({ is_cover: true }).eq("id", next.id);
    }
  }

  revalidatePath("/admin/products");
  return NextResponse.json({ ok: true });
}

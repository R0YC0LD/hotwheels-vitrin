import { randomUUID } from "crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
// Not: Vercel serverless fonksiyonlarında istek gövdesi varsayılan olarak ~4.5MB
// ile sınırlıdır. Telefon kameralarından gelen çok büyük dosyalar için farklı
// bir deployment hedefi (ör. Node.js sunucusu) veya client-side sıkıştırma
// gerekebilir.
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
  }

  const file = formData.get("file");
  const productId = formData.get("productId");
  const isCoverRequested = formData.get("isCover") === "true";

  if (!(file instanceof File) || typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "Dosya ve ürün ID'si gerekli." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Desteklenmeyen dosya tipi." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Dosya çok büyük (maksimum 15MB)." }, { status: 400 });
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const processedBuffer = await sharp(inputBuffer)
      .rotate() // EXIF orientation'a göre otomatik döndür, ardından metadata'yı at
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const fileName = `${randomUUID()}.webp`;
    const storagePath = `products/${productId}/${fileName}`;

    const adminClient = createAdminClient();
    const { error: uploadError } = await adminClient.storage
      .from("product-images")
      .upload(storagePath, processedBuffer, { contentType: "image/webp", upsert: false });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: "Fotoğraf yüklenemedi. Tekrar deneyin." }, { status: 500 });
    }

    const { count } = await auth.supabase
      .from("product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    const shouldBeCover = isCoverRequested || (count ?? 0) === 0;

    if (shouldBeCover) {
      await auth.supabase.from("product_images").update({ is_cover: false }).eq("product_id", productId);
    }

    const { data: imageRow, error: insertError } = await auth.supabase
      .from("product_images")
      .insert({
        product_id: productId,
        storage_path: storagePath,
        sort_order: count ?? 0,
        is_cover: shouldBeCover,
      })
      .select()
      .single();

    if (insertError) {
      await adminClient.storage.from("product-images").remove([storagePath]);
      console.error(insertError);
      return NextResponse.json({ error: "Fotoğraf kaydedilemedi." }, { status: 500 });
    }

    return NextResponse.json({ image: imageRow });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fotoğraf işlenemedi. Tekrar deneyin." }, { status: 500 });
  }
}

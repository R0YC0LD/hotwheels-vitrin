import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createOrderRequestSchema } from "@/lib/validation/order";

const ERROR_MESSAGES: Record<string, string> = {
  EMPTY_CART: "Sepetiniz boş.",
  PRODUCT_NOT_FOUND: "Sepetinizdeki bir ürün artık mevcut değil.",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Girdiğiniz bilgileri kontrol edin.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { customerName, email, phone, address, city, district, items } = parsed.data;
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: customerName,
    p_email: email,
    p_phone: phone,
    p_address: address,
    p_city: city,
    p_district: district || null,
    p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  });

  if (error) {
    const code = error.message?.split(":")[0]?.trim();
    if (code === "OUT_OF_STOCK") {
      return NextResponse.json(
        { error: `Sepetinizdeki bir ürün artık stokta yok: ${error.message.split(":")[1]?.trim() ?? ""}` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: ERROR_MESSAGES[code] ?? "Sipariş oluşturulamadı. Tekrar deneyin." },
      { status: 400 }
    );
  }

  return NextResponse.json({ order: data });
}

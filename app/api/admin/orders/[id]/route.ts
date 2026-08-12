import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { updateOrderStatus } from "@/lib/db/admin/orders";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body?.status || !(body.status in ORDER_STATUS_LABELS)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(auth.supabase, auth.user.id, id, body.status);
    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sipariş güncellenemedi." }, { status: 500 });
  }
}

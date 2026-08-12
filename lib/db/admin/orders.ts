/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

export async function listOrders(supabase: any, filters: { status?: string; page?: number } = {}) {
  const page = filters.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select("*, order_items(id)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    orders: (data ?? []).map((o: any) => ({ ...o, itemCount: o.order_items?.length ?? 0 })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getOrderById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  supabase: any,
  adminId: string,
  id: string,
  status: string
) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("activity_logs")
    .insert({ admin_id: adminId, action: "order_status_changed", entity: "order", entity_id: id, metadata: { status } });

  return data;
}

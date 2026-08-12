import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalProducts: number;
  published: number;
  sold: number;
  draft: number;
  hidden: number;
  totalStock: number;
  totalRevenue: number;
  pendingOrders: number;
  recentProducts: { id: string; name: string; slug: string; status: string; created_at: string }[];
  recentSold: { id: string; name: string; slug: string; price: number; sold_at: string | null }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const base = () => supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null);

  const [
    totalProducts,
    published,
    sold,
    draft,
    hidden,
    stockRows,
    ordersAgg,
    pendingOrders,
    recentProducts,
    recentSold,
  ] = await Promise.all([
    base(),
    base().eq("status", "published"),
    base().eq("status", "sold"),
    base().eq("status", "draft"),
    base().eq("status", "hidden"),
    supabase.from("products").select("stock").is("deleted_at", null).eq("status", "published"),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "awaiting_payment"]),
    supabase
      .from("products")
      .select("id, name, slug, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, slug, price, sold_at")
      .eq("status", "sold")
      .is("deleted_at", null)
      .order("sold_at", { ascending: false })
      .limit(5),
  ]);

  const totalStock = (stockRows.data ?? []).reduce(
    (sum: number, row: { stock: number }) => sum + row.stock,
    0
  );
  const totalRevenue = (ordersAgg.data ?? []).reduce(
    (sum: number, row: { total: number }) => sum + Number(row.total),
    0
  );

  return {
    totalProducts: totalProducts.count ?? 0,
    published: published.count ?? 0,
    sold: sold.count ?? 0,
    draft: draft.count ?? 0,
    hidden: hidden.count ?? 0,
    totalStock,
    totalRevenue,
    pendingOrders: pendingOrders.count ?? 0,
    recentProducts: recentProducts.data ?? [],
    recentSold: recentSold.data ?? [],
  };
}

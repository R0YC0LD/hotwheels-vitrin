import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  getSoldProductsPage,
  type ProductFilters,
  type SortOption,
} from "@/lib/db/products";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (params.get("only") === "sold") {
    const page = params.get("page") ? Number(params.get("page")) : 1;
    try {
      const result = await getSoldProductsPage(page, 24);
      return NextResponse.json(result);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Ürünler yüklenemedi." }, { status: 500 });
    }
  }

  const filters: ProductFilters = {
    categorySlug: params.get("category") ?? undefined,
    brand: params.get("brand") ?? undefined,
    manufacturer: params.get("manufacturer") ?? undefined,
    productTypeSlug: params.get("type") ?? undefined,
    condition: params.get("condition") ?? undefined,
    packageType: params.get("package") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    rare: params.get("rare") === "true" ? true : undefined,
    inStockOnly: params.get("inStock") === "true" ? true : undefined,
    includeSold: params.get("includeSold") === "true" ? true : undefined,
    sort: (params.get("sort") as SortOption | null) ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : 1,
    pageSize: 24,
  };

  try {
    const result = await getProducts(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürünler yüklenemedi." }, { status: 500 });
  }
}

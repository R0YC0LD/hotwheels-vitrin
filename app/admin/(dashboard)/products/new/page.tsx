import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getActiveCategories } from "@/lib/db/categories";
import { getAllTags, getProductTypes } from "@/lib/db/tags";

export const metadata: Metadata = { title: "Yeni Ürün" };

export default async function NewProductPage() {
  const [categories, productTypes, tags] = await Promise.all([
    getActiveCategories(),
    getProductTypes(),
    getAllTags(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">Yeni Ürün</h1>
      <ProductForm mode="new" categories={categories} productTypes={productTypes} tags={tags} />
    </div>
  );
}

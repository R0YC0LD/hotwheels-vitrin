import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductActionsMenu } from "@/components/admin/product-actions-menu";
import { Badge } from "@/components/ui/badge";
import { getAdminProductById } from "@/lib/db/admin/products";
import { createClient } from "@/lib/supabase/server";
import { getActiveCategories } from "@/lib/db/categories";
import { getAllTags, getProductTypes } from "@/lib/db/tags";
import { PRODUCT_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Ürünü Düzenle" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [product, categories, productTypes, tags] = await Promise.all([
    getAdminProductById(supabase, id),
    getActiveCategories(),
    getProductTypes(),
    getAllTags(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{product.name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant="default">
              {PRODUCT_STATUS_LABELS[product.status as keyof typeof PRODUCT_STATUS_LABELS]}
            </Badge>
            {product.sku && <span className="text-xs text-foreground-muted">SKU: {product.sku}</span>}
          </div>
        </div>
        <ProductActionsMenu product={product} />
      </div>

      <ProductForm
        mode="edit"
        product={product}
        categories={categories}
        productTypes={productTypes}
        tags={tags}
      />
    </div>
  );
}

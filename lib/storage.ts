const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = "product-images";

/** storage_path -> herkese açık, doğrudan görüntülenebilir URL. */
export function productImageUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

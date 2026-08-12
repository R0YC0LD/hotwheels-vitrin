-- ============================================================================
-- Storage: product-images bucket + policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public okuma (görseller herkese açık gösterilir)
create policy "product_images_bucket_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Yazma yalnızca admin (upload API route servis anahtarıyla da yazabilir,
-- servis anahtarı RLS'i tamamen bypass eder; bu policy tarayıcıdan doğrudan
-- authenticated admin erişimi için ek güvenlik katmanıdır).
create policy "product_images_bucket_admin_write"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_bucket_admin_update"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_bucket_admin_delete"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());

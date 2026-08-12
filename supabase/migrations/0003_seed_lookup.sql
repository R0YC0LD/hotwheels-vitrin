-- ============================================================================
-- Başlangıç lookup verisi (ürün DEĞİL — kategori/tip/ayar varsayılanları).
-- Admin panelinden bunlara ekleme/çıkarma/düzenleme yapılabilir.
-- ============================================================================

insert into public.product_types (name, slug) values
  ('Mainline', 'mainline'),
  ('Premium', 'premium'),
  ('Treasure Hunt', 'treasure-hunt'),
  ('Super Treasure Hunt', 'super-treasure-hunt'),
  ('Chase', 'chase'),
  ('Exclusive', 'exclusive'),
  ('Limited', 'limited'),
  ('Custom', 'custom'),
  ('Other', 'other')
on conflict (slug) do nothing;

insert into public.categories (name, slug, description, active) values
  ('JDM', 'jdm', 'Japon otomobil kültürü', true),
  ('European', 'european', 'Avrupa üretimi modeller', true),
  ('American Muscle', 'american-muscle', 'Amerikan kas arabaları', true),
  ('German', 'german', 'Alman markaları', true),
  ('Italian', 'italian', 'İtalyan markaları', true),
  ('Premium', 'premium', 'Premium seri parçalar', true),
  ('Mainline', 'mainline', 'Standart seri parçalar', true)
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Porsche', 'porsche'), ('JDM', 'jdm-tag'), ('Rare', 'rare'), ('TH', 'th'),
  ('STH', 'sth'), ('Chase', 'chase-tag'), ('Premium', 'premium-tag'),
  ('Vintage', 'vintage'), ('Carded', 'carded'), ('Loose', 'loose')
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('site_name', '"Vitrin"'),
  ('logo_url', 'null'),
  ('favicon_url', 'null'),
  ('hero_title', '"Seçilmiş Die-Cast Parçalar."'),
  ('hero_subtitle', '"Kişisel koleksiyonumdan satışa çıkardığım seçilmiş modeller."'),
  ('hero_product_id', 'null'),
  ('instagram_url', 'null'),
  ('whatsapp_number', 'null'),
  ('contact_email', 'null'),
  ('shipping_note', '"Kargo, sipariş onayından sonra 1-3 iş günü içinde gönderilir."'),
  ('footer_text', '"Bu site bağımsız bir koleksiyon satış platformudur ve Mattel veya Hot Wheels ile bağlantılı değildir."'),
  ('show_sold_products', 'true')
on conflict (key) do nothing;

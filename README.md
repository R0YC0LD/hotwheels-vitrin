# Vitrin — Premium Die-Cast Koleksiyon Satış Sitesi

Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, Storage, RLS) ile
geliştirilmiş, gerçek bir veritabanı ve cloud storage kullanan full-stack koleksiyon satış sitesi.

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi oluşturma

1. [supabase.com](https://supabase.com) üzerinden ücretsiz bir hesap/proje oluşturun.
2. Proje oluşturulduktan sonra **Project Settings > API** sayfasından şu değerleri alın:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (gizli tutun, asla client'a göndermeyin)
3. `.env.example` dosyasını `.env.local` olarak kopyalayıp bu değerleri girin:

```bash
cp .env.example .env.local
```

### 3. Veritabanı şemasını uygulama

Supabase Dashboard > **SQL Editor**'e girin ve `supabase/migrations/` klasöründeki dosyaları
**sırasıyla** (0001 → 0002 → 0003) yapıştırıp çalıştırın:

1. `0001_init.sql` — tüm tablolar, indexler, RLS policy'leri, `create_order()` fonksiyonu
2. `0002_storage.sql` — `product-images` storage bucket'ı ve policy'leri
3. `0003_seed_lookup.sql` — başlangıç kategori/etiket/ürün tipi/site ayarları (gerçek ürün DEĞİL)

Alternatif olarak Supabase CLI kuruluysa:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

### 4. İlk admin kullanıcısını oluşturma

Admin panelinde herkese açık kayıt formu **bilerek yok** — admin hesabı iki adımda oluşturulur:

1. Supabase Dashboard > **Authentication > Users > Add user** ile email/şifre girerek bir kullanıcı oluşturun
   (bu otomatik olarak `profiles` tablosunda `role = 'customer'` bir satır oluşturur — bkz. `handle_new_user` trigger'ı).
2. SQL Editor'de bu kullanıcıyı admin yapın:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Artık `/admin/login` adresinden bu email/şifre ile giriş yapabilirsiniz.

### 5. Geliştirme sunucusu

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) — public site
[http://localhost:3000/admin](http://localhost:3000/admin) — admin paneli

## Mimari notları

- **Tek doğruluk kaynağı**: Tüm ürünler, kategoriler, etiketler, siparişler ve site ayarları
  Supabase Postgres'te tutulur. Kaynak kodda hiçbir ürün hard-code edilmez.
- **Görseller**: Admin panelinden yüklenen fotoğraflar sunucu tarafında `sharp` ile
  WebP'ye çevrilip EXIF orientation düzeltilerek Supabase Storage (`product-images` bucket) içine
  yazılır; veritabanında yalnızca `storage_path` tutulur.
- **Stok tutarlılığı**: Sipariş oluşturma `create_order()` Postgres fonksiyonu içinde satır
  kilitleme (`SELECT ... FOR UPDATE`) ile yapılır — iki farklı ziyaretçi aynı tekil ürünü aynı anda
  satın almaya çalışırsa yalnızca biri başarılı olur.
- **Yetkilendirme**: `/admin/*` rotaları `middleware.ts` içinde hem oturum hem de
  `profiles.role = 'admin'` kontrolüyle korunur; ayrıca her admin API route'u kendi içinde de
  aynı kontrolü tekrar yapar (middleware bypass edilse bile).
- **Cache**: Admin panelinden yapılan create/update/delete işlemleri ilgili public sayfaları
  `revalidatePath` ile anında günceller — yeniden deploy gerekmez.

## Proje yapısı

```
app/(site)/        Public site (ana sayfa, koleksiyon, ürün detay, sepet, checkout)
app/admin/          Admin paneli (dashboard, ürünler, siparişler, ayarlar)
app/api/            Route handler'lar (upload, orders, admin CRUD)
components/ui/      Radix + Tailwind tabanlı temel bileşenler
components/site/    Public site bileşenleri
components/admin/   Admin paneli bileşenleri
lib/supabase/       Browser/server/admin Supabase client'ları + middleware
lib/db/             Tipli veritabanı sorgu fonksiyonları
lib/validation/     Zod şemaları
supabase/migrations/ SQL migration dosyaları
```

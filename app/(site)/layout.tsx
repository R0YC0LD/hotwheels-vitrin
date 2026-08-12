import { CartProvider } from "@/components/site/cart-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <Header siteName={settings.site_name} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}

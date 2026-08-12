import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-border bg-background-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {settings.site_name}
          </p>
          <p className="mt-3 max-w-xs text-sm text-foreground-secondary">
            Kişisel die-cast koleksiyonundan satışa çıkan seçilmiş modeller.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Keşfet
          </span>
          <Link href="/collection" className="text-foreground-secondary hover:text-foreground">
            Koleksiyon
          </Link>
          <Link href="/sold" className="text-foreground-secondary hover:text-foreground">
            Satılanlar
          </Link>
          <Link href="/about" className="text-foreground-secondary hover:text-foreground">
            Hakkında
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">
            İletişim
          </span>
          {settings.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="text-foreground-secondary hover:text-foreground"
            >
              {settings.contact_email}
            </a>
          )}
          {settings.instagram_url && (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-secondary hover:text-foreground"
            >
              Instagram
            </a>
          )}
          {settings.shipping_note && (
            <p className="mt-2 text-xs text-foreground-muted">{settings.shipping_note}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-7xl text-xs text-foreground-muted">
          {settings.footer_text ??
            "Bu site bağımsız bir koleksiyon satış platformudur ve Mattel veya Hot Wheels ile bağlantılı değildir."}
        </p>
      </div>
    </footer>
  );
}

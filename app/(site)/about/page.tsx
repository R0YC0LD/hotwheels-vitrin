import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db/settings";

export const metadata: Metadata = { title: "Hakkında" };

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Hakkında
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground-secondary">
        <p>
          {settings.site_name}, yıllar içinde bir araya getirdiğim kişisel die-cast koleksiyonumdan
          seçilmiş parçaları sergilediğim ve satışa çıkardığım bağımsız bir vitrindir.
        </p>
        <p>
          Burada listelenen her parça büyük çoğunlukla tek adet olarak elimde bulunan, dikkatle
          saklanmış koleksiyon parçalarıdır. Bir parça satıldığında koleksiyondan çıkar ve arşivde
          &quot;Satıldı&quot; etiketiyle kalabilir.
        </p>
        <p>
          Sorularınız için {settings.contact_email ? (
            <a href={`mailto:${settings.contact_email}`} className="text-accent hover:underline">
              {settings.contact_email}
            </a>
          ) : (
            "iletişim bilgileri"
          )}{" "}
          üzerinden ya da ürün sayfalarındaki WhatsApp butonu ile ulaşabilirsiniz.
        </p>
        {settings.footer_text && (
          <p className="text-xs text-foreground-muted">{settings.footer_text}</p>
        )}
      </div>
    </div>
  );
}

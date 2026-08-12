import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <CheckCircle2 className="size-12 text-success" strokeWidth={1.25} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        Siparişiniz Alındı
      </h1>
      {number && (
        <p className="mt-2 text-sm text-foreground-secondary">
          Sipariş numaranız: <span className="font-medium text-foreground">{number}</span>
        </p>
      )}
      <p className="mt-4 max-w-sm text-sm text-foreground-secondary">
        Siparişiniz &quot;ödeme bekleniyor&quot; durumunda oluşturuldu. Ödeme detayları için en
        kısa sürede e-posta veya telefon ile sizinle iletişime geçilecek.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/collection">Koleksiyona Devam Et</Link>
      </Button>
    </div>
  );
}

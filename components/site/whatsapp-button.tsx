import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  phoneNumber,
  productName,
  sku,
}: {
  phoneNumber: string;
  productName: string;
  sku?: string | null;
}) {
  return (
    <Button asChild variant="secondary" size="lg" className="w-full">
      <a
        href={buildWhatsAppLink(phoneNumber, productName, sku)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="size-4" />
        WhatsApp&apos;tan Satın Al
      </a>
    </Button>
  );
}

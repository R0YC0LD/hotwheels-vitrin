export function buildWhatsAppLink(phoneNumber: string, productName: string, sku?: string | null) {
  const digits = phoneNumber.replace(/[^\d]/g, "");
  const message = sku
    ? `Merhaba, ${productName} ile ilgileniyorum. Ürün kodu: ${sku}`
    : `Merhaba, ${productName} ile ilgileniyorum.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

import { format } from "date-fns";

export function formatDate(value?: string | null, { withTime = false } = {}): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  try {
    return format(d, withTime ? "dd MMM yyyy HH:mm" : "dd MMM yyyy");
  } catch {
    return value;
  }
}

// helper for formatting rupiah without sign
export const formatRupiah = (amount: number | string, options: { withSymbol?: boolean } = { withSymbol: true }) => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount ? amount : 0;
  if (options.withSymbol) {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      currencyDisplay: "code",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(n);
  }

  const formatter = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(n);
};

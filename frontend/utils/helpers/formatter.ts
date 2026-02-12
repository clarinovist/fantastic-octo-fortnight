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
export const formatDate = (
  dateString: string,
  options?: { withTime?: boolean }
) => {
  const date = new Date(dateString);

  if (options?.withTime) {
    const dateFormat = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);

    const timeFormat = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    return `${dateFormat} ${timeFormat}`;
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("id-ID", formatOptions).format(date);
};

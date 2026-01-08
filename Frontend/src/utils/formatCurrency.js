export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(Number(amount || 0));
};

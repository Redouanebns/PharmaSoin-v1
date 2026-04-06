export const formatCurrencyWithContext = (formatter, amount) => {
  if (typeof formatter === 'function') {
    return formatter(amount);
  }
  return `${Number(amount || 0).toFixed(2)} DH`;
};

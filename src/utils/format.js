const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatPrice = (n) => currency.format(n);
export const discounted = (price, pct = 0) => price * (1 - pct / 100);
export const titleCase = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

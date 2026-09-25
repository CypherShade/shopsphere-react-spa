export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';
export const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE) || 12;

// Only request the fields the list views render - smaller payloads, faster LCP
const LIST_FIELDS = 'title,price,thumbnail,rating,category,discountPercentage,brand,stock';

export const endpoints = {
  products: ({ page = 1, limit = PAGE_SIZE, q = '', sortBy = '', order = 'asc' } = {}) => {
    const params = new URLSearchParams({
      limit: String(limit),
      skip: String((page - 1) * limit),
      select: LIST_FIELDS,
    });
    if (sortBy) {
      params.set('sortBy', sortBy);
      params.set('order', order);
    }
    if (q) {
      params.set('q', q);
      return `${API_BASE}/products/search?${params}`;
    }
    return `${API_BASE}/products?${params}`;
  },
  byCategory: (slug, { skip = 0, limit = PAGE_SIZE } = {}) =>
    `${API_BASE}/products/category/${encodeURIComponent(slug)}?limit=${limit}&skip=${skip}&select=${LIST_FIELDS}`,
  product: (id) => `${API_BASE}/products/${encodeURIComponent(id)}`,
  categories: () => `${API_BASE}/products/categories`,
};

export const PRODUCT_SORTS = {
  '': { label: 'Featured' },
  'price-asc': { label: 'Price: low to high', sortBy: 'price', order: 'asc' },
  'price-desc': { label: 'Price: high to low', sortBy: 'price', order: 'desc' },
  'rating-desc': { label: 'Top rated', sortBy: 'rating', order: 'desc' },
  'title-asc': { label: 'Name A–Z', sortBy: 'title', order: 'asc' },
};

/** Parse catalog URL search params ( ?q=&page=&sort= ) into normalised values */
export function parseCatalogParams(searchParams) {
  const sort = PRODUCT_SORTS[searchParams.get('sort')] ? searchParams.get('sort') : '';
  return {
    q: searchParams.get('q') ?? '',
    sort,
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };
}

/** Single source for the catalog request URL, shared by the route loader and the page */
export function catalogUrl({ q, sort, page }) {
  const { sortBy, order } = PRODUCT_SORTS[sort] ?? {};
  return endpoints.products({ page, q, sortBy, order });
}

export const topRatedUrl = endpoints.products({ limit: 8, sortBy: 'rating', order: 'desc' });

export async function fetchJSON(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const err = new Error(res.status === 404 ? 'Resource not found' : `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

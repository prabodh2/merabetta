export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder?: number;
  description?: string | null;
  image?: string | null;
  icon?: string;
  color?: string;
  bg?: string;
}

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
}

export interface ApiProduct {
  id: string;
  productId?: string;
  variantId?: string | null;
  name: string;
  subtitle?: string;
  description?: string;
  brandId?: string;
  brandName?: string;
  sku?: string;
  attributes?: Record<string, string | number>;
  categoryId?: string;
  categoryIds?: string[];
  categories?: string[];
  price?: number;
  mrp?: number;
  stock?: number;
  available?: boolean;
  image?: string;
  images?: string[];
  min_order_quantity?: number;
  max_order_quantity?: number | null;
  product_group_code?: string;
}

export interface ProductsResponse {
  data: ApiProduct[];
  total: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

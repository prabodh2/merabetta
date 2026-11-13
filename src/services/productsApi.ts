import { ApiCategory, ApiBrand, ApiProduct, ProductsResponse, ProductFilters } from '../types/products';

const API_BASE = process.env.NEXT_PUBLIC_MERABETTA_API_BASE || 'https://api.merabetta.com';

// Mock/fallback products for testing when live catalog has 0 sellable items (as documented in backend spec)
const SAMPLE_TEST_PRODUCTS: ApiProduct[] = [
  {
    id: 'product:101',
    productId: '101',
    name: 'Friends Premium Adult Diaper Pants - Large (Pack of 10)',
    subtitle: 'High Absorbency & Odor Lock up to 10 Hours',
    description: 'Designed specifically for elderly care with antibacterial core, wetness indicator, and breathable cottony soft layer.',
    brandId: '2',
    brandName: 'FRIENDS',
    sku: 'FRND-AD-L10',
    categoryId: '1',
    categoryIds: ['2', '1'],
    categories: ['Daily Living', 'Adult Diaper'],
    price: 499,
    mrp: 650,
    stock: 45,
    available: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 10,
  },
  {
    id: 'product:102',
    productId: '102',
    name: 'Dr. Morepen Digital Blood Pressure Monitor BP-02',
    subtitle: 'Fully Automatic Upper Arm BP Machine with WHO Indicator',
    description: 'Accurate systolic, diastolic, and pulse rate reading with memory storage for 2 users and large LCD display.',
    brandId: '16',
    brandName: 'DR MOREPEN',
    sku: 'DRM-BP-02',
    categoryId: '126',
    categoryIds: ['32', '126'],
    categories: ['Health Monitoring', 'Automatic BP Monitor'],
    price: 1399,
    mrp: 1899,
    stock: 20,
    available: true,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 5,
  },
  {
    id: 'product:103',
    productId: '103',
    name: 'Flamingo Foldable Lightweight Commode Wheelchair',
    subtitle: 'Chrome Plated Steel Frame with Removable Pan',
    description: 'Ergonomic elderly mobility wheelchair with padded armrests, brake locks, and sturdy solid rubber tires.',
    brandId: '17',
    brandName: 'FLAMINGO',
    sku: 'FLM-WC-809',
    categoryId: '30',
    categoryIds: ['30'],
    categories: ['Mobility Aids'],
    price: 6499,
    mrp: 8500,
    stock: 12,
    available: true,
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 2,
  },
  {
    id: 'product:104',
    productId: '104',
    name: 'Arrex Orthopedic Senior Recliner Backrest Bed',
    subtitle: 'Multi-angle Adjustable Medical Back Support for Senior Comfort',
    description: 'Provides relief for spine, neck, and acid reflux. Fits on top of any regular single or double bed.',
    brandId: '15',
    brandName: 'ARREX',
    sku: 'ARX-BR-01',
    categoryId: '67',
    categoryIds: ['67'],
    categories: ['Comfort & Furniture'],
    price: 3250,
    mrp: 4200,
    stock: 8,
    available: true,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 3,
  },
  {
    id: 'product:105',
    productId: '105',
    name: 'Lifree Extra Absorb Adult Pants - Medium (Pack of 10)',
    subtitle: 'Underwear-style Pull-up Diaper for Active Elders',
    description: 'Flexible waistband, 6-glass absorption capacity, and leak-proof side leg gathers for day & night protection.',
    brandId: '4',
    brandName: 'LIFREE',
    sku: 'LFR-EAP-M10',
    categoryId: '1',
    categoryIds: ['2', '1'],
    categories: ['Daily Living', 'Adult Diaper'],
    price: 540,
    mrp: 690,
    stock: 35,
    available: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 12,
  },
  {
    id: 'product:106',
    productId: '106',
    name: 'Flamingo Anti-Slip Walking Stick with Quad Tripod Base',
    subtitle: 'Height Adjustable Anodized Aluminum Walking Cane',
    description: 'Shock-absorbing grip handle and self-standing 4-prong rubber base for maximum stability on uneven surfaces.',
    brandId: '17',
    brandName: 'FLAMINGO',
    sku: 'FLM-WS-QD',
    categoryId: '30',
    categoryIds: ['30'],
    categories: ['Mobility Aids'],
    price: 890,
    mrp: 1250,
    stock: 28,
    available: true,
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 5,
  },
  {
    id: 'product:107',
    productId: '107',
    name: 'Smart SOS Emergency Panic Alert Button & Pager',
    subtitle: 'Wireless Elderly Caregiver Call System with 500ft Range',
    description: 'Waterproof necklace transmitter and plug-in chime receiver with 38 melodious ringtones for home safety.',
    brandId: '18',
    brandName: 'LOCAL',
    sku: 'LCL-SOS-01',
    categoryId: '203',
    categoryIds: ['203'],
    categories: ['Safety Gadgets'],
    price: 1750,
    mrp: 2499,
    stock: 19,
    available: true,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 4,
  },
  {
    id: 'product:108',
    productId: '108',
    name: 'Senior Vitality Calcium + Vitamin D3 & Zinc (60 Tablets)',
    subtitle: 'Bone Density & Joint Mobility Formulation for 60+ Adults',
    description: 'High bioavailability calcium citrate malate with Vitamin D3 to strengthen bones and prevent osteoporosis.',
    brandId: '16',
    brandName: 'DR MOREPEN',
    sku: 'DRM-SUP-CAD3',
    categoryId: '255',
    categoryIds: ['255'],
    categories: ['Food and Supplement'],
    price: 380,
    mrp: 520,
    stock: 50,
    available: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    ],
    min_order_quantity: 1,
    max_order_quantity: 6,
  }
];

export async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/app/products/categories`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[productsApi] fetchCategories error:', error);
    return [];
  }
}

export async function fetchBrands(): Promise<ApiBrand[]> {
  try {
    const res = await fetch(`${API_BASE}/api/app/products/brands`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch brands: ${res.status}`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[productsApi] fetchBrands error:', error);
    return [];
  }
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined) params.set('offset', String(filters.offset));
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.q?.trim()) params.set('q', filters.q.trim());

    const queryString = params.toString();
    const url = `${API_BASE}/api/app/products${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return {
          data: json.data,
          total: json.total || json.data.length,
        };
      }
    }
  } catch (err) {
    console.warn('[productsApi] Live products fetch encountered issue, falling back to mock dataset:', err);
  }

  // Graceful fallback for testing as documented in Backend Reference Page 8:
  // "GET /api/app/products -> 200; data: [], total: 0 (Current backend follow-up: inspect catalog mode)"
  let filtered = [...SAMPLE_TEST_PRODUCTS];

  if (filters.category) {
    const catId = String(filters.category);
    filtered = filtered.filter(p => 
      p.categoryId === catId || p.categoryIds?.includes(catId)
    );
  }

  if (filters.brand) {
    filtered = filtered.filter(p => String(p.brandId) === String(filters.brand));
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.subtitle?.toLowerCase().includes(q) ||
      p.brandName?.toLowerCase().includes(q)
    );
  }

  const offset = filters.offset || 0;
  const limit = filters.limit || 50;
  const paged = filtered.slice(offset, offset + limit);

  return {
    data: paged,
    total: filtered.length,
  };
}

export async function fetchProductById(id: string): Promise<ApiProduct | null> {
  try {
    const encodedId = encodeURIComponent(id);
    const res = await fetch(`${API_BASE}/api/app/products/${encodedId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Ignore and fallback
  }

  const found = SAMPLE_TEST_PRODUCTS.find(p => p.id === id || p.productId === id);
  return found || null;
}

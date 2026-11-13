'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import {
  fetchCategories,
  fetchBrands,
  fetchProducts,
} from '@/services/productsApi';
import { ApiCategory, ApiBrand, ApiProduct } from '@/types/products';
import {
  Search,
  Sparkles,
  ShoppingBag,
  X,
  Package,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function ProductsPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [, setTotalProducts] = useState<number>(0);
  const [, setIsLoading] = useState<boolean>(true);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(false);

  // Filter States
  const [selectedRootId, setSelectedRootId] = useState<string>('all');
  const [selectedSubId, setSelectedSubId] = useState<string>('all');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Selected Product for Details Modal
  const [activeModalProduct, setActiveModalProduct] = useState<ApiProduct | null>(null);

  // Load Categories and Brands from API on Mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [cats, brds] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
        ]);
        setCategories(cats);
        setBrands(brds);
        if (cats.length > 0) {
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.error('Failed to load catalog metadata:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Compute Root Categories (parentId === null) as per PDF guide
  const rootCategories = useMemo(() => {
    return categories.filter((c) => c.parentId === null);
  }, [categories]);

  // Compute Subcategories for currently selected Root
  const currentSubcategories = useMemo(() => {
    if (selectedRootId === 'all') return [];
    return categories.filter((c) => String(c.parentId) === String(selectedRootId));
  }, [categories, selectedRootId]);

  // Load Products when Filters Change
  useEffect(() => {
    async function loadProductsList() {
      setIsProductsLoading(true);
      try {
        // As per PDF: use leaf subcategory if selected, otherwise root category ID
        const categoryParam =
          selectedSubId !== 'all'
            ? selectedSubId
            : selectedRootId !== 'all'
            ? selectedRootId
            : undefined;

        const brandParam = selectedBrandId !== 'all' ? selectedBrandId : undefined;

        const res = await fetchProducts({
          category: categoryParam,
          brand: brandParam,
          q: searchQuery.trim() || undefined,
          limit: 50,
          offset: 0,
        });

        setProducts(res.data);
        setTotalProducts(res.total);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsProductsLoading(false);
      }
    }

    loadProductsList();
  }, [selectedRootId, selectedSubId, selectedBrandId, searchQuery]);

  // Handler when clicking a root category
  const handleSelectRoot = (rootId: string) => {
    setSelectedRootId(rootId);
    setSelectedSubId('all'); // reset subcategory on root change
  };

  const handleResetFilters = () => {
    setSelectedRootId('all');
    setSelectedSubId('all');
    setSelectedBrandId('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-clip">
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Header & API Health Indicator */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200/70 rounded-full text-xs font-bold text-[#E86A33]">
                <Sparkles className="w-3.5 h-3.5 text-[#E86A33] shrink-0" />
                <span>Live Eldercare Catalog & Products</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Senior Care Products & Essentials
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Explore categorized healthcare equipment, daily living essentials, mobility aids, and wellness supplies. Connected directly to the Merabetta backend catalog API.
              </p>
            </div>

            {/* API Connection Health Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 w-full md:w-auto md:min-w-[240px] shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Backend API Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isLiveConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isLiveConnected ? 'Live Connected' : 'Connecting...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                api.merabetta.com
              </p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{categories.length} Categories</span>
                <span>•</span>
                <span>{brands.length} Brands</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & Brand Filter Bar ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name, brand, or subtitle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden sm:inline">
              Brand:
            </span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="flex-1 md:flex-initial min-w-0 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] shadow-2xs cursor-pointer truncate"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {(selectedRootId !== 'all' ||
              selectedSubId !== 'all' ||
              selectedBrandId !== 'all' ||
              searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Root Categories Navigation ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E86A33]" />
              Explore Main Categories
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {rootCategories.length} Root Categories
            </span>
          </div>

          {/* Root Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {/* "All" Button */}
            <button
              type="button"
              onClick={() => handleSelectRoot('all')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                selectedRootId === 'all'
                  ? 'bg-[#E86A33] text-white border-[#E86A33] shadow-sm font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRootId === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-orange-100 text-[#E86A33]'
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">
                All Products
              </span>
            </button>

            {/* Individual Root Categories */}
            {rootCategories.map((cat) => {
              const isSelected = selectedRootId === cat.id;
              const subCount = categories.filter(
                (c) => String(c.parentId) === String(cat.id)
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectRoot(cat.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 group ${
                    isSelected
                      ? 'bg-[#E86A33] text-white border-[#E86A33] shadow-md ring-2 ring-[#E86A33]/20 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
                  }`}
                >
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 relative">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          // Fallback icon on broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Layers className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {subCount} subs
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Subcategories Bar (if a Root is selected) ── */}
        {selectedRootId !== 'all' && currentSubcategories.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 uppercase tracking-wider">
                Subcategories under{' '}
                <span className="text-[#E86A33]">
                  {categories.find((c) => c.id === selectedRootId)?.name}
                </span>:
              </span>
              <span className="text-slate-400">{currentSubcategories.length} available</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedSubId('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubId === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All in Category
              </button>
              {currentSubcategories.map((sub) => {
                const isSubSelected = selectedSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isSubSelected
                        ? 'bg-orange-50 text-[#E86A33] border-orange-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Products Section ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E86A33]" />
              <h2 className="text-lg font-bold text-slate-900">
                Products Listing ({products.length})
              </h2>
            </div>
            {isProductsLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Updating catalog...
              </span>
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((item) => {
                const discount =
                  item.mrp && item.price && item.mrp > item.price
                    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                    : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveModalProduct(item)}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col overflow-hidden group"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-12 h-12 text-slate-300" />
                      )}

                      {/* Brand Tag Top Left */}
                      {item.brandName && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-md shadow-2xs uppercase tracking-wider">
                          {item.brandName}
                        </span>
                      )}

                      {/* Discount Badge Top Right */}
                      {discount && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md shadow-2xs">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-[#E86A33] uppercase tracking-wide">
                          {item.categories?.[0] || 'Elder Care'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#E86A33] transition-colors leading-snug">
                          {item.name}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Cart Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-extrabold text-slate-900">
                              ₹{item.price?.toLocaleString('en-IN') || '—'}
                            </span>
                            {item.mrp && item.mrp > (item.price || 0) && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{item.mrp.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {item.available !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 bg-orange-50 hover:bg-[#E86A33] text-[#E86A33] hover:text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-orange-50 text-[#E86A33] rounded-full flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  No products found for this filter
                </h3>
                <p className="text-xs text-slate-500">
                  Try selecting a different category or clearing the current brand/search filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#E86A33] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#d65b26] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Product Quick View Modal ── */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto overscroll-contain border border-slate-200 shadow-2xl relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Product Image */}
              <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                {activeModalProduct.image ? (
                  <img
                    src={activeModalProduct.image}
                    alt={activeModalProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-slate-300" />
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {activeModalProduct.brandName && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-md">
                        {activeModalProduct.brandName}
                      </span>
                    )}
                    <span className="text-xs text-[#E86A33] font-semibold">
                      {activeModalProduct.categories?.join(' > ')}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {activeModalProduct.name}
                  </h2>

                  {activeModalProduct.subtitle && (
                    <p className="text-xs text-slate-500 font-medium">
                      {activeModalProduct.subtitle}
                    </p>
                  )}

                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{activeModalProduct.price?.toLocaleString('en-IN')}
                    </span>
                    {activeModalProduct.mrp && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{activeModalProduct.mrp?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {activeModalProduct.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                      {activeModalProduct.description}
                    </p>
                  )}

                  {/* Metadata Fields */}
                  <div className="pt-2 space-y-1 text-xs text-slate-500">
                    {activeModalProduct.sku && (
                      <p>
                        <span className="font-semibold text-slate-700">SKU:</span>{' '}
                        {activeModalProduct.sku}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-slate-700">Stock Status:</span>{' '}
                      <span className="text-emerald-600 font-semibold">
                        {activeModalProduct.stock ? `${activeModalProduct.stock} units available` : 'Available on request'}
                      </span>
                    </p>
                    {activeModalProduct.min_order_quantity && (
                      <p>
                        <span className="font-semibold text-slate-700">Min Order Qty:</span>{' '}
                        {activeModalProduct.min_order_quantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <a
                    href="https://wa.me/918999188267?text=Hello%20Merabetta,%20I%20am%20interested%20in%20product%20inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-[#E86A33] hover:bg-[#d65b26] text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors"
                  >
                    Inquire via WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveModalProduct(null)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import FacilityCard from '@/components/homes/FacilityCard';
import ScheduleVisitModal from '@/components/homes/ScheduleVisitModal';
import SearchBar from '@/components/search/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { PublicFacility } from '@/utils/publicHomes';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Search,
  MapPin,
  HeartPulse,
  IndianRupee,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  PhoneCall,
  X,
  Star,
  Award,
  Shield,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

const FREE_PREVIEW_COUNT = 2;
const SUBSCRIBED_LIMIT = 10;

export default function SeniorLivingDirectoryPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [facilities, setFacilities] = useState<PublicFacility[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSubscribed = isLoggedIn && !!user?.isSubscribed;

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchField, setSearchField] = useState<string | undefined>(undefined);
  const [selectedCareType, setSelectedCareType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<string>('rating');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Quick Chips
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterDoctor247, setFilterDoctor247] = useState<boolean>(false);
  const [filterVegMeals, setFilterVegMeals] = useState<boolean>(false);
  const [filterPalliative, setFilterPalliative] = useState<boolean>(false);

  // Visit Modal State
  const [modalFacility, setModalFacility] = useState<PublicFacility | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);


  // ── Care type → service filter mapping ──
  const CARE_TYPE_TO_SERVICES: Record<string, string[]> = {
    assisted: ['Assisted Living'],
    palliative: ['Palliative Care'],
    independent: ['Independent Living'],
    dementia: ['Dementia Care'],
    hospital: ['Home Hospital'],
  };

  // ── Sort field mapping ──
  const SORT_MAP: Record<string, { field: string; order: 'asc' | 'desc' }> = {
    rating: { field: 'createdAt', order: 'desc' },
    price_asc: { field: 'price', order: 'asc' },
    price_desc: { field: 'price', order: 'desc' },
    capacity: { field: 'capacity', order: 'desc' },
  };

  // Fetch homes via the new generic search API
  const fetchHomes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build structured search request
      const searchRequest: Record<string, unknown> = {
        page: currentPage,
        limit: SUBSCRIBED_LIMIT,
      };

      // Query text
      if (searchQuery.trim()) {
        searchRequest.query = searchQuery.trim();
        // If a specific search field was selected in the SearchBar
        if (searchField) {
          const fieldMap: Record<string, string[]> = {
            homeName: ['homeName'],
            pinCode: ['pinCode'],
            city: ['city', 'address'],
            state: ['state'],
            services: ['services', 'medical'],
            livingType: ['services'],
          };
          searchRequest.fields = fieldMap[searchField] || undefined;
        }
      }

      // Build filters
      const filters: Record<string, unknown> = {};

      if (selectedCity && selectedCity !== 'all') {
        filters.city = selectedCity;
      }

      if (selectedCareType !== 'all' && CARE_TYPE_TO_SERVICES[selectedCareType]) {
        filters.services = CARE_TYPE_TO_SERVICES[selectedCareType];
      }

      if (maxPrice < 50000) {
        filters.price = { max: maxPrice };
      }

      if (Object.keys(filters).length > 0) {
        searchRequest.filters = filters;
      }

      // Sort
      if (sortBy && SORT_MAP[sortBy]) {
        searchRequest.sort = SORT_MAP[sortBy];
      }

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });
      const data = await res.json();

      if (data.success) {
        setFacilities(data.data || data.facilities || []);
        if (data.pagination) {
          setTotalResults(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
        if (data.availableCities) {
          setAvailableCities(data.availableCities);
        }
      }
    } catch (err) {
      console.error('Failed to load homes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity, searchQuery, searchField, selectedCareType, maxPrice, sortBy, currentPage]);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  // Client-side quick chip filtering
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (filterVerifiedOnly && !f.verified) return false;
      if (filterDoctor247 && !f.medical.doctorVisits) return false;
      if (filterVegMeals && !f.services.meals) return false;
      if (filterPalliative && !f.services.palliativeCare) return false;
      return true;
    });
  }, [facilities, filterVerifiedOnly, filterDoctor247, filterVegMeals, filterPalliative]);

  // Cache preview IDs so their detail page is automatically unlocked
  useEffect(() => {
    if (typeof window !== 'undefined' && filteredFacilities.length > 0) {
      const allowedCount = isSubscribed ? SUBSCRIBED_LIMIT : FREE_PREVIEW_COUNT;
      const topIds = filteredFacilities.slice(0, allowedCount).flatMap((f) => [
        f.id,
        f.referenceId,
        f.id?.toLowerCase(),
        f.referenceId?.toLowerCase(),
      ]).filter(Boolean);
      sessionStorage.setItem('merabetta_free_preview_ids', JSON.stringify(topIds));
    }
  }, [filteredFacilities, isSubscribed]);

  const handleOpenVisitModal = (facility: PublicFacility) => {
    setModalFacility(facility);
    setIsVisitModalOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCity('all');
    setSearchQuery('');
    setSearchField(undefined);
    setSelectedCareType('all');
    setMaxPrice(50000);
    setSortBy('rating');
    setCurrentPage(1);
    setFilterVerifiedOnly(false);
    setFilterDoctor247(false);
    setFilterVegMeals(false);
    setFilterPalliative(false);
  };

  // Handle search from SearchBar component
  const handleSearch = useCallback(({ query, field }: { query: string; field?: string }) => {
    setSearchQuery(query);
    setSearchField(field);
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedCareType, maxPrice, sortBy]);




  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        {/* Navigation Bar */}
        <PublicNavbar />

        {/* ── HERO BANNER: High-Trust Split Hero with Ambient Warm Gradient ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4">
          <div className="bg-gradient-to-br from-[#FFF7F2] via-[#FBF7FF] to-[#F3EEFF] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-orange-100/80 shadow-sm">
            {/* Background Ambient Glow Orbs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-200/40 to-pink-100/30 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: High-Trust Copy + Trust Pillars + Key Stats Strip */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#E86A33] border border-orange-200/80 text-xs font-black shadow-2xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.directory.hero.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black text-slate-900 tracking-tight leading-[1.12]">
                  {t.directory.hero.titlePart1} <br />
                  <span className="bg-gradient-to-r from-[#E86A33] via-[#F2783D] to-[#D85820] bg-clip-text text-transparent">
                    {t.directory.hero.titlePart2}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
                  {t.directory.hero.subtitle}
                </p>

                {/* Trust Pillars */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 pt-1">
                  <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-2xs border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.directory.hero.tagHospital}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-2xs border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.directory.hero.tagFood}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-2xs border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.directory.hero.tagVisits}
                  </span>
                </div>

                {/* MNC Authority Key Metrics Strip */}
                <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/70 shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">50+</p>
                    <p className="text-[11px] font-semibold text-slate-500">Verified Homes in MH</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/70 shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-[#E86A33] leading-tight flex items-center gap-1">
                      <span>4.9</span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500 inline" />
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">2,400+ Families Trust</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/70 shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 leading-tight">₹0</p>
                    <p className="text-[11px] font-semibold text-slate-500">Zero Brokerage Fee</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Emotional Care Photo Collage with Live Trust Badges */}
              <div className="lg:col-span-5 relative hidden lg:block">
                {/* Main Hero Photo */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
                    alt="Compassionate Senior Living Care"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-xs font-black drop-shadow-sm">Compassionate 24/7 Assisted Care</p>
                    <p className="text-[10px] text-white/90">Dignity, medical security & warmth for your parents</p>
                  </div>
                </div>

                {/* Inset Sub-Image */}
                <div className="absolute -bottom-5 -left-5 w-32 aspect-square rounded-2xl overflow-hidden shadow-xl border-3 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80"
                    alt="Comfortable Senior Suite"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Badge 1: Top Right */}
                <div className="absolute -top-3 -right-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 leading-tight">Fire & Medical NOC</p>
                    <p className="text-[9px] font-semibold text-emerald-700">100% On-Site Audited</p>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Right */}
                <div className="absolute -bottom-4 -right-2 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E86A33] flex items-center justify-center font-black text-xs">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 leading-tight">Doctor On-Call</p>
                    <p className="text-[9px] font-semibold text-slate-500">ICU & Emergency Tie-up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ELEVATED SEARCH & DISCOVERY BAR ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-200/90 space-y-4">
            {/* Quick Category Intent Tabs */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 overflow-x-auto scrollbar-none text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-extrabold tracking-wider mr-1 shrink-0">
                Care Category:
              </span>
              {[
                { id: 'all', label: 'All Care Types' },
                { id: 'assisted', label: 'Assisted Living' },
                { id: 'palliative', label: 'Bedridden / ICU' },
                { id: 'independent', label: 'Independent Living' },
                { id: 'dementia', label: 'Dementia Care' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedCareType(type.id)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap text-xs font-bold ${
                    selectedCareType === type.id
                      ? 'bg-[#E86A33] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Input Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* 1. City Dropdown */}
              <div className="md:col-span-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t.directory.search.cityLabel}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#E86A33] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] cursor-pointer appearance-none"
                  >
                    <option value="all">{t.directory.search.allLocations}</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city.toLowerCase()}>
                        {city}
                      </option>
                    ))}
                    <option value="pune">Pune</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="thane">Thane</option>
                    <option value="nashik">Nashik</option>
                    <option value="kharghar">Kharghar / Navi Mumbai</option>
                  </select>
                </div>
              </div>

              {/* 2. Care Level Selector */}
              <div className="md:col-span-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t.directory.search.careLabel}
                </label>
                <div className="relative">
                  <HeartPulse className="w-4 h-4 text-[#E86A33] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCareType}
                    onChange={(e) => setSelectedCareType(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] cursor-pointer appearance-none"
                  >
                    <option value="all">{t.directory.search.allCareTypes}</option>
                    <option value="assisted">{t.directory.search.careAssisted}</option>
                    <option value="palliative">{t.directory.search.carePalliative}</option>
                    <option value="independent">{t.directory.search.careIndependent}</option>
                    <option value="dementia">{t.directory.search.careDementia}</option>
                  </select>
                </div>
              </div>

              {/* 3. Smart SearchBar — replaces old text input + button */}
              <div className="md:col-span-6">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t.directory.search.facilityLabel}
                </label>
                <SearchBar
                  onSearch={handleSearch}
                  initialQuery={searchQuery}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Budget Range Slider & Sorting */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-500 font-semibold whitespace-nowrap">
                  {t.directory.search.budgetLabel}
                </span>
                <span className="font-extrabold text-[#E86A33] bg-orange-50 px-2.5 py-1 rounded-lg">
                  ₹{maxPrice >= 50000 ? '50,000+' : `${maxPrice.toLocaleString('en-IN')}`} {t.directory.search.perMo}
                </span>
                <input
                  type="range"
                  min="10000"
                  max="50000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-[#E86A33] w-36 sm:w-48 ml-2 cursor-pointer"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-slate-400 font-medium">{t.directory.search.sortByLabel}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#E86A33] cursor-pointer"
                >
                  <option value="rating">{t.directory.search.sortHighestRated}</option>
                  <option value="price_asc">{t.directory.search.sortPriceAsc}</option>
                  <option value="price_desc">{t.directory.search.sortPriceDesc}</option>
                  <option value="capacity">{t.directory.search.sortCapacity}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── RESULTS HEADER & COUNT ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCity !== 'all'
                ? `${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} • ${t.directory.listings.title}`
                : t.directory.listings.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSubscribed
                ? `Showing ${Math.min(filteredFacilities.length, SUBSCRIBED_LIMIT)} verified homes with transparent monthly pricing`
                : t.directory.listings.subtitle(Math.min(filteredFacilities.length, FREE_PREVIEW_COUNT))}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(selectedCity !== 'all' || selectedCareType !== 'all' || searchQuery || maxPrice < 50000) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-full text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>{t.directory.listings.resetFilters}</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600">{t.directory.listings.activeListing}</span>
            </div>
          </div>
        </section>

        {/* ── FACILITY CARDS GRID (2 or 3 Columns) ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-0 shadow-xs animate-pulse">
                  <div className="aspect-16/10 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-slate-100 rounded-lg w-20" />
                      <div className="h-6 bg-slate-100 rounded-lg w-24" />
                    </div>
                    <div className="h-10 bg-slate-200 rounded-full w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFacilities.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8">
              <div className="w-16 h-16 bg-orange-50 text-[#E86A33] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{t.directory.listings.emptyTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.directory.listings.emptySubtitle}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>{t.directory.listings.resetFilters}</span>
              </button>
            </div>
          ) : (
            /* Real Facility Grid with Preview Mode */
            <div className="space-y-8">
              {!isSubscribed ? (
                /* ── NON-SUBSCRIBED: Balanced 3-column layout with 2 free cards + 1 Unlock card, followed by locked teasers ── */
                <div className="space-y-8">
                  {/* Row 1: 2 Free Preview Homes + 1 Unlock Promo Card filling Column 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {filteredFacilities.slice(0, FREE_PREVIEW_COUNT).map((facility) => (
                      <FacilityCard
                        key={facility.id || facility.referenceId}
                        facility={facility}
                        onBookVisit={handleOpenVisitModal}
                        isFreePreview={true}
                      />
                    ))}

                    {/* Column 3: High-Converting Directory Access Pass Card */}
                    <div className="bg-gradient-to-br from-[#FFF7F2] via-white to-[#FFF2EA] rounded-3xl border-2 border-orange-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-orange-200/50 to-amber-100/40 blur-2xl pointer-events-none" />

                      <div className="space-y-4 relative z-10">
                        {/* Top Badge */}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#E86A33] text-[11px] font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Directory Access Pass</span>
                          </span>
                          <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-0.5 rounded-full border border-orange-200/80 shadow-2xs">
                            ₹999 / 6 Mo
                          </span>
                        </div>

                        {/* Title & Lock */}
                        <div className="flex items-start gap-3 pt-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E86A33] to-[#D85820] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                            <Lock className="w-6 h-6 stroke-[2.2]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                              Unlock 10 Verified Homes
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                              Get direct owner phone numbers, live vacant beds & all monthly tariffs.
                            </p>
                          </div>
                        </div>

                        {/* 4 Feature Checklist */}
                        <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-700 bg-white/70 p-3.5 rounded-2xl border border-orange-100/80">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                            <span>Direct Owner Mobile & WhatsApp</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                            <span>All Monthly Tariffs & Hidden Costs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                            <span>Live Vacant Bed Availability</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                            <span>Doctor On-Call & Nursing Staff Details</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4 relative z-10 space-y-2 border-t border-orange-100 mt-4">
                        <Link
                          href={isLoggedIn ? '/payment' : '/login'}
                          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E86A33] to-[#D85820] hover:brightness-105 text-white text-xs sm:text-sm font-black shadow-md shadow-orange-500/25 active:scale-98 transition-all cursor-pointer text-center"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isLoggedIn ? 'Pay ₹999 & Unlock 10 Homes' : 'Sign In & Unlock 10 Homes (₹999 / 6 Mo)'}</span>
                        </Link>
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                          {isLoggedIn ? 'Instant 6-month access across Maharashtra' : 'Already have access? Log in →'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3 Locked Teaser Listings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#E86A33]" />
                          <span>More Homes in This Area (Locked)</span>
                        </h3>
                        <p className="text-xs text-slate-400">Unlock your pass to view full details and contact information.</p>
                      </div>
                      <Link
                        href={isLoggedIn ? '/payment' : '/login'}
                        className="text-xs font-bold text-[#E86A33] hover:underline"
                      >
                        Unlock all →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                      {(filteredFacilities.length > FREE_PREVIEW_COUNT
                        ? filteredFacilities.slice(FREE_PREVIEW_COUNT, FREE_PREVIEW_COUNT + 3)
                        : [
                            {
                              id: 'locked-1',
                              referenceId: 'MB-OAH-3341',
                              name: 'Seva Sadan Assisted Living',
                              city: 'Pune',
                              startingPrice: 22000,
                              photos: [{ url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', caption: 'Living Area' }],
                            },
                            {
                              id: 'locked-2',
                              referenceId: 'MB-OAH-4492',
                              name: 'Vatsalya Senior Living Community',
                              city: 'Mumbai',
                              startingPrice: 28000,
                              photos: [{ url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80', caption: 'Garden Courtyard' }],
                            },
                            {
                              id: 'locked-3',
                              referenceId: 'MB-OAH-5521',
                              name: 'Matoshree Elder Care & Nursing',
                              city: 'Thane',
                              startingPrice: 19500,
                              photos: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', caption: 'Private Room' }],
                            },
                          ]
                      ).map((item: any, idx: number) => {
                        const photoUrl = item.photos?.[0]?.url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80';
                        return (
                          <div
                            key={item.id || idx}
                            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all relative"
                          >
                            {/* Blurred Image with Lock Badge */}
                            <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                              <img
                                src={photoUrl}
                                alt={item.name}
                                className="w-full h-full object-cover filter blur-[3px] scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md">
                                  <Lock className="w-3.5 h-3.5 text-[#E86A33]" />
                                  <span>Locked Listing</span>
                                </div>
                              </div>
                              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold">
                                {item.city || 'Maharashtra'}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <h4 className="font-bold text-base text-slate-800 line-clamp-1">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-mono mt-1">
                                  Phone: +91 98•••••••• <span className="text-[#E86A33] font-sans font-bold">(Locked)</span>
                                </p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Tariff</p>
                                  <p className="text-sm font-black text-slate-700">₹••,000 <span className="text-xs font-normal text-slate-400">/mo</span></p>
                                </div>
                                <Link
                                  href={isLoggedIn ? '/payment' : '/login'}
                                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-[#E86A33] text-xs font-bold border border-orange-200/80 transition-all cursor-pointer"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Unlock</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ambient Bottom Strip */}
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 border border-orange-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5 text-center sm:text-left">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E86A33] to-[#D85820] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Looking for more options in Pune, Mumbai, Thane or Nashik?
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Activate the 6-Month Pass (₹999) to unlock 10 verified homes with verified owner phone numbers.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={isLoggedIn ? '/payment' : '/login'}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold shadow-md shrink-0 active:scale-98 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isLoggedIn ? 'Unlock 10 Homes (₹999)' : 'Sign In & Unlock (₹999)'}</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── SUBSCRIBED: Show only 10 cards of homes in the grid ── */
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredFacilities.slice(0, SUBSCRIBED_LIMIT).map((facility) => (
                      <FacilityCard
                        key={facility.id || facility.referenceId}
                        facility={facility}
                        onBookVisit={handleOpenVisitModal}
                      />
                    ))}
                  </div>

                  {/* Concierge Assistance Strip for Subscribed Users */}
                  <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/80 border border-orange-200/70 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-[#E86A33] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <span className="text-[11px] font-extrabold text-[#E86A33] uppercase tracking-wider bg-orange-100/80 px-2.5 py-0.5 rounded-full">
                            Pass Active • 10 Verified Homes
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900 mt-1">
                          Need specialized care options or personal coordination?
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Our care team can help connect you with verified administrators, schedule on-site visits, and check bed availability.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/919371458326?text=Hello%20MeraBetta%2C%20I%20have%20an%20active%20directory%20pass%20and%20need%20assistance%20finding%20senior%20homes."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold shadow-md shrink-0 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Talk to Concierge</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Schedule a Visit Modal */}
      <ScheduleVisitModal
        facility={modalFacility}
        isOpen={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setModalFacility(null);
        }}
      />


      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

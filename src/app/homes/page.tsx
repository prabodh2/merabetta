'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import FacilityCard from '@/components/homes/FacilityCard';
import ScheduleVisitModal from '@/components/homes/ScheduleVisitModal';
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
} from 'lucide-react';

export default function SeniorLivingDirectoryPage() {
  const { t, language } = useLanguage();
  const [facilities, setFacilities] = useState<PublicFacility[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCareType, setSelectedCareType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<string>('rating');

  // Quick Chips
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterDoctor247, setFilterDoctor247] = useState<boolean>(false);
  const [filterVegMeals, setFilterVegMeals] = useState<boolean>(false);
  const [filterPalliative, setFilterPalliative] = useState<boolean>(false);

  // Visit Modal State
  const [modalFacility, setModalFacility] = useState<PublicFacility | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);

  // Fetch approved homes from API
  const fetchHomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCareType !== 'all') params.append('careType', selectedCareType);
      if (maxPrice < 50000) params.append('maxPrice', maxPrice.toString());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/homes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities || []);
        if (data.availableCities) {
          setAvailableCities(data.availableCities);
        }
      }
    } catch (err) {
      console.error('Failed to load homes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity, searchQuery, selectedCareType, maxPrice, sortBy]);

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

  const handleOpenVisitModal = (facility: PublicFacility) => {
    setModalFacility(facility);
    setIsVisitModalOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCity('all');
    setSearchQuery('');
    setSelectedCareType('all');
    setMaxPrice(50000);
    setSortBy('rating');
    setFilterVerifiedOnly(false);
    setFilterDoctor247(false);
    setFilterVegMeals(false);
    setFilterPalliative(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        {/* Navigation Bar */}
        <PublicNavbar />

        {/* ── HERO BANNER: Brand Lilac Frame (#EBE6F8) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="bg-[#EBE6F8] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-purple-100/60 shadow-xs">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/40 pointer-events-none blur-2xl" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-100/50 pointer-events-none blur-2xl" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#E86A33] text-xs font-black shadow-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.directory.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E232F] tracking-tight leading-[1.15]">
                {t.directory.hero.titlePart1} <br />
                <span className="text-[#E86A33]">{t.directory.hero.titlePart2}</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal max-w-2xl">
                {t.directory.hero.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.directory.hero.tagHospital}
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.directory.hero.tagFood}
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.directory.hero.tagVisits}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FLOATING OYO-STYLE SEARCH & FILTER BAR ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/90 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* 1. City Dropdown */}
              <div className="md:col-span-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t.directory.search.cityLabel}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#E86A33] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] cursor-pointer"
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
                  <HeartPulse className="w-4 h-4 text-[#E86A33] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCareType}
                    onChange={(e) => setSelectedCareType(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] cursor-pointer"
                  >
                    <option value="all">{t.directory.search.allCareTypes}</option>
                    <option value="assisted">{t.directory.search.careAssisted}</option>
                    <option value="palliative">{t.directory.search.carePalliative}</option>
                    <option value="independent">{t.directory.search.careIndependent}</option>
                    <option value="dementia">{t.directory.search.careDementia}</option>
                  </select>
                </div>
              </div>

              {/* 3. Search Query / Name */}
              <div className="md:col-span-4">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t.directory.search.facilityLabel}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t.directory.search.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 4. Action Button */}
              <div className="md:col-span-2 pt-1 md:pt-4">
                <button
                  type="button"
                  onClick={fetchHomes}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#E86A33] hover:bg-[#D85820] active:scale-98 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t.directory.search.searchBtn}</span>
                </button>
              </div>
            </div>

            {/* Budget Range Slider */}
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

        {/* ── QUICK FILTER CHIPS BAR ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 shrink-0">
              {t.directory.quickTags.label}
            </span>

            <button
              onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterVerifiedOnly
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.directory.quickTags.verified}</span>
            </button>

            <button
              onClick={() => setFilterDoctor247(!filterDoctor247)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterDoctor247
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#E86A33]" />
              <span>{t.directory.quickTags.doctor247}</span>
            </button>

            <button
              onClick={() => setFilterVegMeals(!filterVegMeals)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterVegMeals
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              <span>🥗 {t.directory.quickTags.pureVeg}</span>
            </button>

            <button
              onClick={() => setFilterPalliative(!filterPalliative)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterPalliative
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-purple-300'
              }`}
            >
              <span>🛏️ {t.directory.quickTags.bedridden}</span>
            </button>

            {(selectedCity !== 'all' || selectedCareType !== 'all' || searchQuery || maxPrice < 50000 || filterVerifiedOnly || filterDoctor247 || filterVegMeals || filterPalliative) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-full text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>{t.directory.listings.resetFilters}</span>
              </button>
            )}
          </div>
        </section>

        {/* ── RESULTS HEADER & COUNT ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCity !== 'all'
                ? `${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} • ${t.directory.listings.title}`
                : t.directory.listings.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.directory.listings.subtitle(filteredFacilities.length)}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600">{t.directory.listings.activeListing}</span>
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
            /* Real Facility Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id || facility.referenceId}
                  facility={facility}
                  onBookVisit={handleOpenVisitModal}
                />
              ))}
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

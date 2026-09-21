'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicFacility } from '@/utils/publicHomes';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
  Hospital,
  HeartPulse,
  IndianRupee,
  CheckCircle2,
  Calendar,
  ExternalLink,
  GitCompareArrows,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface FacilityCardProps {
  facility: PublicFacility;
  onBookVisit?: (facility: PublicFacility) => void;
  isCompareSelected?: boolean;
  onToggleCompare?: (facilityId: string) => void;
  compareDisabled?: boolean;
}

export default function FacilityCard({ facility, onBookVisit, isCompareSelected, onToggleCompare, compareDisabled }: FacilityCardProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const { t } = useLanguage();

  const photos = facility.photos || [];
  const currentPhoto = photos[activePhotoIdx]?.url || photos[0]?.url;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const detailUrl = `/homes/${facility.referenceId || facility.id}`;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
      {/* ── 1. Photo Carousel Container ── */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden select-none">
        <Link href={detailUrl} className="block w-full h-full">
          <img
            src={currentPhoto}
            alt={photos[activePhotoIdx]?.caption || facility.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.directory.card.verified}</span>
          </div>

          <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
            {facility.referenceId}
          </span>
        </div>

        {/* Carousel Navigation Arrows (desktop hover) */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Previous Photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next Photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
              {photos.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activePhotoIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Starting Price Tag Ribbon */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <div className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-xl text-white text-right">
            <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider leading-none">
              {t.directory.card.startingFrom}
            </span>
            <span className="text-sm font-black text-white flex items-center gap-0.5 justify-end mt-0.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#E86A33]" />
              {facility.startingPrice.toLocaleString('en-IN')}
              <span className="text-[11px] font-normal text-slate-300">{t.directory.card.perMonth}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Card Content ── */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Rating and Distance Banner */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-900 font-bold">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              </div>
              <span>{facility.rating}</span>
              <span className="text-slate-400 font-normal">({facility.reviewCount})</span>
            </div>

            <span className="text-[11px] font-semibold text-[#E86A33] bg-orange-50 px-2 py-0.5 rounded-full">
              {facility.distanceLandmark}
            </span>
          </div>

          {/* Facility Title */}
          <Link href={detailUrl} className="block group-hover:text-[#E86A33] transition-colors">
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight line-clamp-1">
              {facility.name}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {facility.city}, {facility.state} • {t.directory.card.est} {facility.yearEstablished}
            </span>
          </div>

          {/* Care Feature Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {facility.services.assistedLiving && (
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#E86A33] text-[11px] font-bold border border-orange-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t.directory.search.careAssisted}
              </span>
            )}
            {facility.services.palliativeCare && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200/60 flex items-center gap-1">
                <HeartPulse className="w-3 h-3" />
                {t.directory.search.carePalliative}
              </span>
            )}
            {facility.medical.doctorVisits && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60 flex items-center gap-1">
                <Hospital className="w-3 h-3" />
                {t.directory.card.doctorOnCall}
              </span>
            )}
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {t.directory.card.cap} {facility.capacity} {t.directory.card.residents}
            </span>
          </div>
        </div>

        {/* ── 3. Dual Call to Action Buttons ── */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {/* Compare Toggle */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(facility.referenceId || facility.id)}
              disabled={compareDisabled && !isCompareSelected}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isCompareSelected
                  ? 'bg-purple-100 text-purple-800 border border-purple-300 shadow-xs'
                  : compareDisabled
                    ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span>{isCompareSelected ? '✓ Added to Compare' : 'Add to Compare'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {/* Secondary: Book a Free Visit */}
            <button
              type="button"
              onClick={() => onBookVisit?.(facility)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer hover:scale-101 active:scale-98"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.directory.card.bookVisit}</span>
            </button>

            {/* Primary: View Details */}
            <Link
              href={detailUrl}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-101 active:scale-98"
            >
              <span>{t.directory.card.viewDetails}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


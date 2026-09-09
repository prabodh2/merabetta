'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import PhotoLightbox from '@/components/homes/PhotoLightbox';
import { PublicFacility } from '@/utils/publicHomes';
import {
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Star,
  Hospital,
  HeartPulse,
  IndianRupee,
  Calendar,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  Building2,
  User,
  Coffee,
  Heart,
  Activity,
  Bed,
  Check,
  FileCheck,
  AlertCircle,
  Share2,
  Copy,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [facility, setFacility] = useState<PublicFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Photo Lightbox
  const [activePhotoLightboxIdx, setActivePhotoLightboxIdx] = useState<number | null>(null);

  // Booking Card State
  const [bookingTab, setBookingTab] = useState<'visit' | 'reserve'>('visit');
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorPhone, setVisitorPhone] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('Morning (10:00 AM – 01:00 PM)');
  const [careLevel, setCareLevel] = useState<string>('Assisted Living');
  const [roomChoice, setRoomChoice] = useState<string>('Private Suite');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);
  const [inquirySuccessCode, setInquirySuccessCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch Facility
  const fetchFacility = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/homes/${id}`);
      const data = await res.json();
      if (data.success && data.facility) {
        setFacility(data.facility);
      } else {
        setErrorMsg(data.error || 'Facility details could not be found.');
      }
    } catch {
      setErrorMsg('Failed to fetch facility profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    if (!visitorName.trim() || !visitorPhone.trim()) {
      alert('Please provide your full name and phone number.');
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const res = await fetch(`/api/homes/${facility.referenceId || facility.id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookingTab,
          fullName: visitorName,
          phoneNumber: visitorPhone,
          preferredDate,
          timeSlot,
          residentCondition: careLevel,
          roomType: roomChoice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInquirySuccessCode(data.referenceCode || 'BK-CONFIRMED');
      } else {
        alert(data.error || 'Submission failed. Please contact us via WhatsApp.');
      }
    } catch {
      alert('Network error. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col justify-between">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
          <div className="w-10 h-10 border-4 border-[#E86A33] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-700">Loading verified facility profile...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (errorMsg || !facility) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col justify-between">
        <PublicNavbar />
        <div className="flex-1 max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Facility Not Found</h2>
          <p className="text-xs text-slate-500">{errorMsg || 'The requested senior living facility is not available.'}</p>
          <Link
            href="/homes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E86A33] text-white text-xs font-bold shadow-xs hover:bg-[#D85820]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Directory</span>
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const photos = facility.photos || [];
  const whatsappUrl = `https://wa.me/919371458326?text=${encodeURIComponent(
    `Hello MeraBetta Team, I am interested in inquiring about ${facility.name} (${facility.referenceId}) in ${facility.city}. Please share admission details.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />

        {/* ── BREADCRUMBS & TOP CONTROLS ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Breadcrumb links */}
            <div className="flex items-center gap-1.5 text-slate-500 flex-wrap">
              <Link href="/homes" className="hover:text-[#E86A33] font-semibold transition-colors">
                Homes Directory
              </Link>
              <span>/</span>
              <Link href={`/homes?city=${facility.city.toLowerCase()}`} className="hover:text-[#E86A33] font-semibold transition-colors">
                {facility.city}
              </Link>
              <span>/</span>
              <span className="font-bold text-slate-900 truncate max-w-xs">{facility.name}</span>
            </div>

            {/* Share & Save */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>

              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {facility.referenceId}
              </span>
            </div>
          </div>
        </div>

        {/* ── FACILITY TITLE & SUMMARY HEADER ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  MeraBetta Verified Facility
                </span>
                <span className="text-[11px] font-bold text-[#E86A33] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  {facility.organizationType} Organization
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Est. {facility.yearEstablished}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {facility.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{facility.address}, {facility.city}, {facility.state} - {facility.pinCode}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#E86A33] font-semibold">{facility.distanceLandmark}</span>
              </p>
            </div>

            {/* Star Rating Badge */}
            <div className="flex items-center gap-2 self-start md:self-center bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-base">
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-500" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{facility.rating} / 5.0</div>
                <div className="text-[10px] text-slate-400 font-medium">Based on {facility.reviewCount} family reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AIRBNB / OYO 5-PHOTO MOSAIC SHOWCASE ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-16/11 sm:aspect-16/9 md:aspect-21/9 max-h-[520px]">
              {/* Main Big Photo (Left 2 cols) */}
              <div
                onClick={() => setActivePhotoLightboxIdx(0)}
                className="md:col-span-2 relative group overflow-hidden cursor-pointer h-full"
              >
                <img
                  src={photos[0]?.url}
                  alt={photos[0]?.caption || facility.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Grid 4 Small Photos (Right 2 cols) */}
              <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
                {photos.slice(1, 5).map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhotoLightboxIdx(i + 1)}
                    className="relative group overflow-hidden cursor-pointer h-full bg-slate-200"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${i + 2}`}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating "View All Photos" Button */}
            <button
              type="button"
              onClick={() => setActivePhotoLightboxIdx(0)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-slate-800 text-xs font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer hover:scale-103 active:scale-98"
            >
              <span>View All {photos.length} Photos</span>
            </button>
          </div>
        </section>

        {/* ── VERIFIED CREDENTIALS TRUST STRIP ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/80 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>MeraBetta Verified Safety & Quality Standards</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Official Partner
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Registration No: <b className="font-mono text-slate-800">{facility.registrationNumber}</b> • Validated by MeraBetta Medical & Legal Audit Team.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-emerald-800">
              <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Fire Safety NOC
              </span>
              <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                24/7 CCTV Monitored
              </span>
              <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Registered Doctors
              </span>
            </div>
          </div>
        </section>

        {/* ── TWO-COLUMN CONTENT & BOOKING CONTAINER ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ════════ LEFT COLUMN: Full Details (8 Cols) ════════ */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1: Overview & About */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#E86A33] uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Facility Overview</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  About {facility.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Established in {facility.yearEstablished}, {facility.name} is a premier senior care and assisted living home situated in {facility.city}. Designed with elderly ergonomics, wheelchair-wide corridors, anti-skid flooring, and serene natural courtyards, our facility offers compassionate medical supervision and vibrant community life for seniors.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Beds</span>
                    <span className="text-lg font-black text-slate-900 mt-0.5">{facility.capacity}</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Residents</span>
                    <span className="text-lg font-black text-emerald-700 mt-0.5">{facility.currentResidents}</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Care Ratio</span>
                    <span className="text-lg font-black text-slate-900 mt-0.5">1:3</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Emergency</span>
                    <span className="text-lg font-black text-[#E86A33] mt-0.5">24/7 ICU</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Room & Accommodation Options */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Accommodation & Monthly Tariffs</h3>
                    <p className="text-xs text-slate-500">Transparent packages including meals, housekeeping, and nursing</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#E86A33] bg-orange-50 px-2.5 py-1 rounded-full">
                    All-Inclusive Meals
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Deluxe Private Room */}
                  <div className="p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Deluxe Private Suite</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-[#E86A33] rounded">
                          POPULAR
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Single occupancy room with attached private bathroom, air-conditioning, TV, and garden balcony.
                      </p>
                      <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Private Attached Washroom</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Dedicated Nurse Call Bell</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Air Conditioned & Wardrobe</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-orange-200/60">
                      <span className="text-[10px] text-slate-400 block font-semibold">Monthly Package:</span>
                      <span className="text-base font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 text-[#E86A33]" />
                        {facility.pricing.assistedLiving?.from || 22000} - {facility.pricing.assistedLiving?.to || 28000}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Twin Sharing Room */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Twin Sharing Room</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          VALUE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Shared with one vetted companion. Promotes socialization and daily interactions.
                      </p>
                      <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Individual Bed & Storage</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Wheelchair Accessible Toilet</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Daily Sanitization</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Monthly Package:</span>
                      <span className="text-base font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 text-[#E86A33]" />
                        {facility.pricing.independentLiving?.from || 15000} - {facility.pricing.independentLiving?.to || 19000}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Palliative / Bedridden Ward */}
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Bedridden / ICU Care</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                          CRITICAL
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Motorized hospital bed, catheter, ryle tube feeding, air mattress & 24/7 dedicated bedside nursing.
                      </p>
                      <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Motorized 3-Function Bed</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Continuous Vital Monitoring</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Oxygen Concentrator Support</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-purple-200/60">
                      <span className="text-[10px] text-slate-400 block font-semibold">Monthly Package:</span>
                      <span className="text-base font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 text-[#E86A33]" />
                        {facility.pricing.palliativeCare?.from || 25000} - {facility.pricing.palliativeCare?.to || 35000}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Medical & Healthcare Infrastructure */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#E86A33] uppercase tracking-wider">
                  <Hospital className="w-4 h-4" />
                  <span>Clinical Infrastructure</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Medical Facilities & Care Protocols</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {[
                    { label: 'Doctor Visits & Health Checkups', active: facility.medical.doctorVisits, desc: 'Regular visits by geriatric physicians and emergency on-call doctors.' },
                    { label: '24/7 Qualified Nursing Staff', active: facility.medical.nursingCare, desc: 'Trained GNM/B.Sc nurses for medicine administration and vitals checking.' },
                    { label: 'Emergency ICU Hospital Tie-up', active: facility.medical.emergencyCare, desc: 'Priority admission protocol with nearby multi-speciality hospital.' },
                    { label: 'Physiotherapy & Mobility Lounge', active: facility.medical.physiotherapy, desc: 'Daily gentle exercises, pain relief, and gait rehabilitation.' },
                    { label: 'Dementia & Alzheimer’s Care', active: facility.services.dementiaCare, desc: 'Safe wander-guard memory care environment with cognitive stimulation.' },
                    { label: 'Emergency Ambulance on Standby', active: true, desc: 'Rapid transit equipped with oxygen and basic life support kit.' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                        item.active ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.active ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Info className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.label}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Food & Lifestyle */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#E86A33] uppercase tracking-wider">
                  <Coffee className="w-4 h-4" />
                  <span>Diet & Daily Community</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Food, Nutrition & Lifestyle Routine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Food is prepared fresh daily under the supervision of a clinical nutritionist. Specialized menus are available for residents with diabetes, hypertension, and swallowing difficulties.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-lg">🥗</span>
                    <span className="font-bold text-slate-800 block mt-1">Pure Veg Meals</span>
                    <span className="text-[10px] text-slate-400">4 times a day</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-lg">🧘</span>
                    <span className="font-bold text-slate-800 block mt-1">Morning Yoga</span>
                    <span className="text-[10px] text-slate-400">Gentle stretching</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-lg">🪔</span>
                    <span className="font-bold text-slate-800 block mt-1">Prayer & Bhajan</span>
                    <span className="text-[10px] text-slate-400">Spiritual wellbeing</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-lg">🌳</span>
                    <span className="font-bold text-slate-800 block mt-1">Walking Garden</span>
                    <span className="text-[10px] text-slate-400">Anti-skid paths</span>
                  </div>
                </div>
              </div>

              {/* Section 5: Neighborhood Vicinity */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#E86A33] uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Neighborhood Context</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Location & Vicinity Landmarks</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{facility.address}</span>
                    <span className="text-slate-500">{facility.city}, {facility.state} - {facility.pinCode}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${facility.name} ${facility.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-[#E86A33] text-slate-700 hover:text-[#E86A33] font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: Sticky Booking Widget (4 Cols) ════════ */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xl space-y-5">
                {/* Tariff Highlight */}
                <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Starting Monthly Fee
                    </span>
                    <div className="flex items-center text-2xl font-black text-slate-900 tracking-tight">
                      <IndianRupee className="w-5 h-5 text-[#E86A33]" />
                      <span>{facility.startingPrice.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1">/ month</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                    Zero Brokerage
                  </span>
                </div>

                {/* Booking Mode Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingTab('visit');
                      setInquirySuccessCode(null);
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      bookingTab === 'visit'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Schedule Free Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingTab('reserve');
                      setInquirySuccessCode(null);
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      bookingTab === 'reserve'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reserve Bed
                  </button>
                </div>

                {/* Form or Confirmation */}
                {inquirySuccessCode ? (
                  <div className="text-center py-5 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">
                      {bookingTab === 'visit' ? 'Visit Tour Booked!' : 'Reservation Request Sent!'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Reference Code: <b className="font-mono text-slate-800">{inquirySuccessCode}</b>. Our senior care team will coordinate with you shortly.
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-full bg-[#25D366] text-white text-xs font-bold shadow-xs hover:bg-[#20ba59] transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                      <span>Connect with Manager on WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
                    {/* Visitor Name */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Deshmukh"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                      />
                    </div>

                    {/* Visitor Phone */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                      />
                    </div>

                    {bookingTab === 'visit' ? (
                      <>
                        {/* Visit Date & Time */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Visit Date</label>
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                            <select
                              value={timeSlot}
                              onChange={(e) => setTimeSlot(e.target.value)}
                              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                            >
                              <option value="Morning">Morning (10-1)</option>
                              <option value="Afternoon">Afternoon (2-5)</option>
                              <option value="Evening">Evening (5-7)</option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Care & Room Choice */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Care Level</label>
                            <select
                              value={careLevel}
                              onChange={(e) => setCareLevel(e.target.value)}
                              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                            >
                              <option value="Independent">Independent</option>
                              <option value="Assisted Living">Assisted</option>
                              <option value="Palliative">Bedridden</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Room Preference</label>
                            <select
                              value={roomChoice}
                              onChange={(e) => setRoomChoice(e.target.value)}
                              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                            >
                              <option value="Private Suite">Private Suite</option>
                              <option value="Twin Sharing">Twin Sharing</option>
                              <option value="ICU Ward">ICU Bed</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="w-full py-3 px-4 rounded-full bg-[#E86A33] hover:bg-[#D85820] active:scale-98 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingInquiry
                          ? 'Submitting Request...'
                          : bookingTab === 'visit'
                          ? 'Confirm Free Guided Tour ↗'
                          : 'Inquire for Room Allotment ↗'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Instant Helpline & WhatsApp Shortcuts */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    <span>WhatsApp Senior Care Counselor</span>
                  </a>

                  <a
                    href="tel:+919371458326"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#E86A33]" />
                    <span>Call Helpline: +91 93714 58326</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoLightbox
        photos={photos}
        activeIndex={activePhotoLightboxIdx}
        onClose={() => setActivePhotoLightboxIdx(null)}
        onSelectIndex={(idx) => setActivePhotoLightboxIdx(idx)}
        facilityName={facility.name}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp facilityName={facility.name} />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

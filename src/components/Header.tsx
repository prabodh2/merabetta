import React from 'react';
import BrandLogo from './BrandLogo';
import { Building2, MapPin, CheckCircle2, PhoneCall, Mail } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  lastSavedTime?: string | null;
}

export default function Header({ lastSavedTime }: HeaderProps) {
  return (
    <header className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Google Form Top Colored Stripe */}
      <div className="h-2.5 bg-[#E86A33] w-full" />

      <div className="p-5 md:p-7 space-y-4">
        {/* Logo and Save Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <BrandLogo size="md" />

          {lastSavedTime && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-xs font-medium self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Draft saved {lastSavedTime}
            </span>
          )}
        </div>

        {/* Company & Document Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#E86A33] uppercase">
            <Building2 className="w-4 h-4 text-[#E86A33]" />
            <span>VISION55 MEGACARE PVT LTD.</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Old Age Home Enrollment Form
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Partner with <span className="font-semibold text-slate-800">Merabetta</span> to list your old age home,
            showcase your facility, manage vacancies, and reach families seeking compassionate senior living and assisted care.
          </p>

          {/* Location & Contact Meta info */}
          <div className="pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Office No 6. Soham Riveria, Near Sun Planet, Anandnagar Pune 411051</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href="tel:+918999188267" className="hover:underline text-slate-700">+91 89991 88267</a>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href="mailto:support@merabetta.com" className="hover:underline text-slate-700">support@merabetta.com</a>
            </div>
          </div>
        </div>

        {/* Google Form Style Required Notice */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="text-slate-500">
            Representative / Home Owner Instructions: Please fill in accurate facility details.
          </p>
          <span className="text-rose-600 font-medium whitespace-nowrap ml-2">
            * Indicates required question
          </span>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import BrandLogo from './BrandLogo';
import { Building2, MapPin, CheckCircle2, PhoneCall, Mail } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language, LANGUAGE_LABELS } from '../i18n/translations';

interface HeaderProps {
  onReset?: () => void;
  lastSavedTime?: string | null;
}

const LANGUAGES: Language[] = ['en', 'mr', 'hi'];

export default function Header({ lastSavedTime }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Google Form Top Colored Stripe */}
      <div className="h-2.5 bg-[#E86A33] w-full" />

      <div className="p-5 md:p-7 space-y-4">
        {/* Logo, Language Switcher, and Save Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <BrandLogo size="md" />

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Language switcher pill buttons */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-[#E86A33] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>

            {lastSavedTime && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t.header.draftSaved} {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        {/* Company & Document Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#E86A33] uppercase">
            <Building2 className="w-4 h-4 text-[#E86A33]" />
            <span>{t.header.company}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {t.header.formTitle}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {t.header.formSubtitle.split('Merabetta').map((part, i) =>
              i === 0 ? (
                <React.Fragment key={i}>{part}<span className="font-semibold text-slate-800">Merabetta</span></React.Fragment>
              ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
              )
            )}
          </p>

          {/* Location & Contact Meta info */}
          <div className="pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t.header.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href="tel:+918999188267" className="hover:underline text-slate-700">
                +91 89991 88267
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href="mailto:support@merabetta.com" className="hover:underline text-slate-700">
                support@merabetta.com
              </a>
            </div>
          </div>
        </div>

        {/* Google Form Style Required Notice */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="text-slate-500">{t.header.instructions}</p>
          <span className="text-rose-600 font-medium whitespace-nowrap ml-2">
            {t.header.required}
          </span>
        </div>
      </div>
    </header>
  );
}

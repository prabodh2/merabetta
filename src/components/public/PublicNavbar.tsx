'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import {
  Menu,
  X,
  PhoneCall,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language, LANGUAGE_LABELS } from '@/i18n/translations';

const LANGUAGES: Language[] = ['en', 'hi', 'mr'];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const navLinks = [
    { label: t.directory.nav.browseHomes, href: '/homes', isCurrent: pathname === '/homes' },
    { label: t.directory.nav.assistedLiving, href: '/homes?careType=assisted_living', isCurrent: false },
    { label: t.directory.nav.palliativeCare, href: '/homes?careType=palliative', isCurrent: false },
    { label: t.directory.nav.dementiaCare, href: '/homes?careType=dementia', isCurrent: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Wordmark */}
        <Link href="/homes" className="flex items-center gap-2 group transition-transform active:scale-98">
          <BrandLogo size="sm" variant="icon" />
          <img 
            src="/merabetta_wordmark.svg" 
            alt="merabetta.com" 
            className="h-4 sm:h-[18px] w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                item.isCurrent
                  ? 'text-[#E86A33] bg-orange-50/80 font-extrabold'
                  : 'text-slate-700 hover:text-[#E86A33] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Language Switcher & Helpline */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/70">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-[#E86A33] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
                aria-label={`Switch to ${LANGUAGE_LABELS[lang]}`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>

          {/* Helpline Contact */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <a
              href="tel:+918999188267"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#E86A33] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#E86A33]" />
              <span>{t.directory.nav.helpline}: 89991 88267</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E86A33]" />
              Language / भाषा:
            </span>
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-[#E86A33] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
                  item.isCurrent
                    ? 'text-[#E86A33] bg-orange-50 font-black'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <a
              href="tel:+918999188267"
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-3 py-2.5 bg-slate-50 rounded-xl"
            >
              <PhoneCall className="w-4 h-4 text-[#E86A33]" />
              <span>{t.directory.nav.helpline}: +91 89991 88267</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}


'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import {
  Menu,
  X,
  PhoneCall,
  ChevronRight,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Heart,
  Settings,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language, LANGUAGE_LABELS } from '@/i18n/translations';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGES: Language[] = ['en', 'hi', 'mr'];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  const navLinks = [
    { label: t.directory.nav.browseHomes, href: '/homes', isCurrent: pathname === '/homes' || pathname?.startsWith('/homes') },
    { label: t.directory.nav.assistedLiving, href: '/homes?careType=assisted_living', isCurrent: false },
    { label: t.directory.nav.palliativeCare, href: '/homes?careType=palliative', isCurrent: false },
    { label: t.directory.nav.dementiaCare, href: '/homes?careType=dementia', isCurrent: false },
  ];

  // Mask phone: 89291***29
  const maskedPhone = user?.phone
    ? user.phone.slice(-10, -7) + '****' + user.phone.slice(-2)
    : '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">

        {/* ─── Left: Logo ─── */}
        <Link href="/homes" className="flex items-center gap-2 group transition-transform active:scale-98 shrink-0">
          <BrandLogo size="sm" variant="icon" />
          <img
            src="/merabetta_wordmark.svg"
            alt="merabetta.com"
            className="h-4 sm:h-[18px] w-auto object-contain"
          />
        </Link>

        {/* ─── Center: Desktop Navigation ─── */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 xl:px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                item.isCurrent
                  ? 'text-[#E86A33] bg-orange-50/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ─── Right: Actions ─── */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60 shrink-0">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-[#E86A33] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
                aria-label={`Switch to ${LANGUAGE_LABELS[lang]}`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>

          {/* Helpline — icon-only on lg, full on xl */}
          <a
            href="tel:+918999188267"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold text-slate-600 hover:text-[#E86A33] hover:bg-orange-50/50 transition-all whitespace-nowrap shrink-0"
            title="24/7 Helpline: 89991 88267"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E86A33] shrink-0" />
            <span className="hidden xl:inline">{t.directory.nav.helpline}: 89991 88267</span>
          </a>

          {/* Login / Profile Avatar Dropdown */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block" ref={profileRef}>
              {/* Avatar Button */}
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  profileOpen
                    ? 'bg-orange-50 border-[#E86A33]/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Avatar Circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E86A33] to-[#D85820] flex items-center justify-center shadow-xs">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E86A33] to-[#D85820] flex items-center justify-center shadow-sm">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Logged In As</p>
                        <p className="text-sm font-bold text-slate-900">+91 {user?.phone?.slice(-10)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <Link
                      href="/homes"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">My Inquiries</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                    </Link>
                    <a
                      href="https://wa.me/919371458326"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span className="font-medium">WhatsApp Support</span>
                    </a>
                    <a
                      href="tel:+918999188267"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors xl:hidden"
                    >
                      <PhoneCall className="w-4 h-4 text-[#E86A33]" />
                      <span className="font-medium">Helpline: 89991 88267</span>
                    </a>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      type="button"
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors w-full cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
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

          {/* Mobile Nav Links */}
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

          {/* Mobile User Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isLoggedIn ? (
              <>
                {/* Logged-in user card */}
                <div className="flex items-center gap-3 px-3 py-3 bg-orange-50/60 rounded-xl border border-orange-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E86A33] to-[#D85820] flex items-center justify-center shadow-sm shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Logged In</p>
                    <p className="text-sm font-bold text-slate-900 truncate">+91 {user?.phone?.slice(-10)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-bold text-white px-4 py-3 bg-[#E86A33] hover:bg-[#D85820] rounded-xl transition-all active:scale-98"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </Link>
            )}

            {/* Helpline */}
            <a
              href="tel:+918999188267"
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-3 py-2.5 bg-slate-50 rounded-xl"
            >
              <PhoneCall className="w-4 h-4 text-[#E86A33]" />
              <span>{t.directory.nav.helpline}: +91 89991 88267</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919371458326"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-emerald-700 px-3 py-2.5 bg-emerald-50 rounded-xl"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Senior Care Counselor</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

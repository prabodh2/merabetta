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
} from 'lucide-react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Browse Homes', href: '/homes', isCurrent: pathname === '/homes' },
    { label: 'Assisted Living', href: '/homes?careType=assisted_living', isCurrent: false },
    { label: 'Palliative Care', href: '/homes?careType=palliative', isCurrent: false },
    { label: 'Dementia Care', href: '/homes?careType=dementia', isCurrent: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/homes" className="flex items-center gap-2 group transition-transform active:scale-98">
            <BrandLogo size="md" />
          </Link>
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#E86A33] border border-orange-200/60 text-[11px] font-bold tracking-wide uppercase">
              Senior Living Directory
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                item.isCurrent
                  ? 'text-[#E86A33] bg-orange-50/80 font-extrabold'
                  : 'text-slate-700 hover:text-[#E86A33] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Helpline Contact */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:+918999188267"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#E86A33] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E86A33]" />
            <span>24/7 Helpline: 89991 88267</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
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
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-3 py-2 bg-slate-50 rounded-lg"
            >
              <PhoneCall className="w-4 h-4 text-[#E86A33]" />
              <span>Senior Care Helpline: +91 89991 88267</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import {
  Heart,
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-12 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              MeraBetta is India&apos;s senior-focused health and care ecosystem, dedicated to making senior living, assisted care, and elder wellness transparent, dignified, and easy to access.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Verified Senior Living Homes
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Senior Living
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/homes?careType=assisted" className="hover:text-[#E86A33] transition-colors">
                  Assisted Living Facilities
                </Link>
              </li>
              <li>
                <Link href="/homes?careType=palliative" className="hover:text-[#E86A33] transition-colors">
                  Palliative & Bedridden Care
                </Link>
              </li>
              <li>
                <Link href="/homes?careType=independent" className="hover:text-[#E86A33] transition-colors">
                  Independent Senior Living
                </Link>
              </li>
              <li>
                <Link href="/homes?careType=dementia" className="hover:text-[#E86A33] transition-colors">
                  Dementia & Memory Care
                </Link>
              </li>
              <li>
                <Link href="/homes" className="hover:text-[#E86A33] transition-colors font-bold text-[#E86A33]">
                  Browse All Homes →
                </Link>
              </li>
            </ul>
          </div>

          {/* Why MeraBetta Standards */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Why MeraBetta
            </h4>
            <ul className="space-y-2">
              <li className="text-slate-600 flex items-center gap-1.5">
                <span className="text-[#E86A33] font-bold">✓</span> 100% Verified Senior Homes
              </li>
              <li className="text-slate-600 flex items-center gap-1.5">
                <span className="text-[#E86A33] font-bold">✓</span> 24/7 Nursing & Doctor Supervision
              </li>
              <li className="text-slate-600 flex items-center gap-1.5">
                <span className="text-[#E86A33] font-bold">✓</span> Free Guided Visit Scheduling
              </li>
              <li className="text-slate-600 flex items-center gap-1.5">
                <span className="text-[#E86A33] font-bold">✓</span> Transparent Monthly Fees
              </li>
              <li className="text-slate-600 flex items-center gap-1.5">
                <span className="text-[#E86A33] font-bold">✓</span> Dedicated Care Counselors
              </li>
            </ul>
          </div>

          {/* Support & Helpline */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              24/7 Senior Helpline
            </h4>
            <div className="space-y-2">
              <a
                href="https://wa.me/919371458326?text=Hello%20MeraBetta%20Team%2C%20I%20am%20looking%20for%20a%20verified%20senior%20living%20home.%20Please%20guide%20me."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                <span>WhatsApp: +91 93714 58326</span>
              </a>
              <a
                href="tel:+919371458326"
                className="flex items-center gap-2 text-slate-900 font-bold hover:text-[#E86A33] transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#E86A33]" />
                <span>+91 93714 58326</span>
              </a>
              <a
                href="mailto:support@merabetta.com"
                className="flex items-center gap-2 text-slate-600 hover:text-[#E86A33] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#E86A33]" />
                <span>support@merabetta.com</span>
              </a>
              <div className="flex items-start gap-2 text-slate-500 pt-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>MeraBetta, Megacare Pvt Ltd, Baner Road, Pune, MH 411045</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Vision55 Megacare Pvt Ltd (MeraBetta.com). All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Verified Care Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import Image from 'next/image';

const navItems = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/vendor/inquiries', label: 'Inquiries & Visits', icon: MessageSquare },
  { href: '/vendor/profile', label: 'Edit Listing', icon: Settings },
];

export default function VendorSidebar() {
  const pathname = usePathname();
  const { vendor, logout } = useVendorAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E86A33] to-[#D85820] flex items-center justify-center shadow-sm shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 leading-tight">MeraBetta</p>
          <p className="text-[10px] font-bold text-[#E86A33] uppercase tracking-wider">Vendor Portal</p>
        </div>
      </div>

      {/* Facility Info */}
      {vendor && (
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Your Facility</p>
          <p className="text-sm font-bold text-slate-900 leading-snug">{vendor.facilityName}</p>
          <p className="text-xs text-slate-500 font-medium">{vendor.facilityCity}</p>
          <span className="inline-block mt-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            ● Active & Verified
          </span>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#E86A33] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E86A33] to-[#D85820] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm text-slate-900">Vendor Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full overflow-y-auto shadow-2xl">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}

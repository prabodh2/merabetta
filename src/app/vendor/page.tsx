'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import {
  MessageSquare,
  Bed,
  Phone,
  Star,
  RefreshCw,
  PhoneCall,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-orange-100 text-orange-700' },
  responded: { label: 'Responded', color: 'bg-blue-100 text-blue-700' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  no_show: { label: 'No Show', color: 'bg-slate-100 text-slate-500' },
};

export default function VendorDashboard() {
  const router = useRouter();
  const { vendor, isLoggedIn, isLoading } = useVendorAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/vendor/login');
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('merabetta-vendor-token');
        const res = await fetch('/api/vendor/inquiries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setInquiries(data.inquiries || []);
      } catch {
        /* silently fail */
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-[#E86A33] rounded-full animate-spin" />
      </div>
    );
  }

  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const visitCount = inquiries.filter((i) => i.type === 'visit').length;
  const recentFive = inquiries.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#E86A33] mb-1">{greeting} 👋</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {vendor?.facilityName}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {vendor?.facilityCity} · Ref: <span className="font-mono text-slate-700">{vendor?.referenceId}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            label: 'New Inquiries',
            value: newCount,
            icon: MessageSquare,
            color: 'bg-orange-50 text-[#E86A33]',
            border: 'border-orange-200/70',
            highlight: newCount > 0,
          },
          {
            label: 'Visit Requests',
            value: visitCount,
            icon: Clock,
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-200/70',
          },
          {
            label: 'Total Leads',
            value: inquiries.length,
            icon: TrendingUp,
            color: 'bg-purple-50 text-purple-600',
            border: 'border-purple-200/70',
          },
          {
            label: 'Listing Status',
            value: '✓ Live',
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600',
            border: 'border-emerald-200/70',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border p-4 sm:p-5 ${stat.border} shadow-xs ${
              stat.highlight ? 'ring-2 ring-[#E86A33]/30' : ''
            }`}
          >
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-base text-slate-900">Recent Inquiries</h2>
            <p className="text-xs text-slate-400 font-medium">Latest 5 family contacts</p>
          </div>
          <Link
            href="/vendor/inquiries"
            className="text-xs font-bold text-[#E86A33] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : recentFive.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No inquiries yet</p>
            <p className="text-xs">They'll appear here when families reach out</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentFive.map((inq) => {
              const whatsappMsg = encodeURIComponent(
                `Namaste ${inq.fullName}, I'm calling from ${vendor?.facilityName} (MeraBetta). We received your inquiry (Ref: ${inq.referenceCode}) for a ${inq.type === 'visit' ? 'visit' : 'bed reservation'} on ${inq.preferredDate}. How can I help you?`
              );
              const status = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;
              return (
                <div key={inq._id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{inq.fullName}</p>
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {inq.type === 'visit' ? '📅 Visit' : '🛏️ Bed Reservation'} ·{' '}
                      {inq.preferredDate} · {inq.timeSlot?.split('(')[0]?.trim()}
                    </p>
                    {inq.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">"{inq.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                      {timeAgo(inq.createdAt)}
                    </span>
                    <a
                      href={`https://wa.me/91${inq.phoneNumber}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:+91${inq.phoneNumber}`}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Call"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link
          href="/vendor/inquiries"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#E86A33]/50 hover:shadow-sm transition-all group"
        >
          <MessageSquare className="w-6 h-6 text-[#E86A33] mb-2" />
          <p className="font-bold text-sm text-slate-900 group-hover:text-[#E86A33]">Manage All Inquiries</p>
          <p className="text-xs text-slate-400 mt-0.5">Update status, call, or WhatsApp families</p>
        </Link>
        <Link
          href="/vendor/profile"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#E86A33]/50 hover:shadow-sm transition-all group"
        >
          <Building2 className="w-6 h-6 text-[#E86A33] mb-2" />
          <p className="font-bold text-sm text-slate-900 group-hover:text-[#E86A33]">Update Beds & Pricing</p>
          <p className="text-xs text-slate-400 mt-0.5">Keep your public listing up to date</p>
        </Link>
      </div>
    </div>
  );
}

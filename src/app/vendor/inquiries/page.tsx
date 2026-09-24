'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import {
  MessageCircle,
  PhoneCall,
  RefreshCw,
  MessageSquare,
  Filter,
  CheckCircle2,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'responded', label: 'Responded' },
  { value: 'done', label: 'Done' },
  { value: 'no_show', label: 'No Show' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-orange-100 text-orange-700' },
  responded: { label: 'Responded', color: 'bg-blue-100 text-blue-700' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  no_show: { label: 'No Show', color: 'bg-slate-100 text-slate-500' },
};

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function VendorInquiriesPage() {
  const router = useRouter();
  const { vendor, isLoggedIn, isLoading } = useVendorAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/vendor/login');
  }, [isLoading, isLoggedIn, router]);

  const fetchInquiries = async () => {
    if (!isLoggedIn) return;
    setLoadingData(true);
    try {
      const token = localStorage.getItem('merabetta-vendor-token');
      const res = await fetch('/api/vendor/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInquiries(data.inquiries || []);
    } catch {
      /* fail silently */
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [isLoggedIn]);

  const handleStatusUpdate = async (inquiryId: string, status: string) => {
    setUpdatingId(inquiryId);
    try {
      const token = localStorage.getItem('merabetta-vendor-token');
      await fetch('/api/vendor/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inquiryId, status }),
      });
      setInquiries((prev) =>
        prev.map((i) => (i._id === inquiryId ? { ...i, status } : i))
      );
    } catch {
      /* fail silently */
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = inquiries.filter((i) => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterType !== 'all' && i.type !== filterType) return false;
    return true;
  });

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-[#E86A33] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inquiries & Visit Requests</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          All families who reached out about{' '}
          <span className="font-bold text-slate-700">{vendor?.facilityName}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === opt.value
                ? 'bg-[#E86A33] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1 self-stretch" />
        {['all', 'visit', 'bed_reservation'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === t
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {t === 'all' ? 'All Types' : t === 'visit' ? '📅 Visits' : '🛏️ Reservations'}
          </button>
        ))}
        <button
          onClick={fetchInquiries}
          className="ml-auto p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No inquiries match this filter</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row (hidden on mobile) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Family / Contact</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Visit Date</div>
              <div className="col-span-2">Notes</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.map((inq) => {
              const whatsappMsg = encodeURIComponent(
                `Namaste ${inq.fullName}, I'm calling from ${vendor?.facilityName} (MeraBetta). We received your inquiry (Ref: ${inq.referenceCode}). How can I help you?`
              );
              const statusConf = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;

              return (
                <div key={inq._id} className="px-5 py-4">
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{inq.fullName}</p>
                        <p className="text-xs text-slate-500 font-medium">{inq.phoneNumber}</p>
                        <span className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a href={`https://wa.me/91${inq.phoneNumber}?text=${whatsappMsg}`} target="_blank" rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a href={`tel:+91${inq.phoneNumber}`}
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <PhoneCall className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inq.type === 'visit' ? '📅 Visit' : '🛏️ Bed Reservation'} · {inq.preferredDate}
                    </p>
                    {inq.notes && <p className="text-xs text-slate-400 italic">"{inq.notes}"</p>}
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
                        <button
                          key={val}
                          onClick={() => handleStatusUpdate(inq._id, val)}
                          disabled={inq.status === val || updatingId === inq._id}
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold cursor-pointer transition-all border ${
                            inq.status === val
                              ? `${conf.color} border-transparent`
                              : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                          } disabled:opacity-60`}
                        >
                          {conf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <p className="font-bold text-sm text-slate-900 truncate">{inq.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{inq.phoneNumber}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(inq.createdAt)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-600">
                        {inq.type === 'visit' ? '📅 Visit' : '🛏️ Reservation'}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-600 font-medium">
                      {inq.preferredDate}
                      <p className="text-[10px] text-slate-400">{inq.timeSlot?.split('(')[0]?.trim()}</p>
                    </div>
                    <div className="col-span-2 text-xs text-slate-400 truncate italic">
                      {inq.notes ? `"${inq.notes}"` : '—'}
                    </div>
                    <div className="col-span-1">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusUpdate(inq._id, e.target.value)}
                        disabled={updatingId === inq._id}
                        className="text-[10px] font-bold border border-slate-200 rounded-lg px-1.5 py-1 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E86A33] disabled:opacity-60"
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
                          <option key={val} value={val}>{conf.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

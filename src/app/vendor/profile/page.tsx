'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Bed, IndianRupee, Save, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function VendorProfilePage() {
  const router = useRouter();
  const { vendor, isLoggedIn, isLoading } = useVendorAuth();

  const [totalBeds, setTotalBeds] = useState(30);
  const [availableBeds, setAvailableBeds] = useState(8);
  const [pricing, setPricing] = useState({
    assistedLiving: 18000,
    privateRoom: 25000,
    dementia: 22000,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/vendor/login');
  }, [isLoading, isLoggedIn, router]);

  const handleSave = async () => {
    if (availableBeds > totalBeds) {
      setError('Available beds cannot exceed total beds');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const token = localStorage.getItem('merabetta-vendor-token');
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ totalBeds, availableBeds, pricing }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save changes');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-[#E86A33] rounded-full animate-spin" />
      </div>
    );
  }

  const occupancyPercent = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Your Listing</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Changes here will reflect on your public{' '}
          <span className="font-bold text-slate-700">{vendor?.facilityName}</span> page on MeraBetta.
        </p>
      </div>

      {saved && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Changes saved successfully!
        </div>
      )}
      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Bed Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <Bed className="w-4 h-4 text-[#E86A33]" />
            </div>
            <h2 className="font-black text-base text-slate-900">Bed Inventory</h2>
          </div>

          {/* Occupancy Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
              <span>Occupancy Rate</span>
              <span className={occupancyPercent >= 90 ? 'text-red-600' : occupancyPercent >= 70 ? 'text-amber-600' : 'text-emerald-600'}>
                {occupancyPercent}% filled
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercent >= 90 ? 'bg-red-400' : occupancyPercent >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>{totalBeds - availableBeds} occupied</span>
              <span>{availableBeds} available</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Total Beds
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalBeds}
                onChange={(e) => setTotalBeds(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Available Beds
              </label>
              <input
                type="number"
                min={0}
                max={totalBeds}
                value={availableBeds}
                onChange={(e) => setAvailableBeds(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-black text-base text-slate-900">Monthly Pricing (₹)</h2>
          </div>
          <div className="flex items-center gap-1.5 mb-5 text-[11px] text-slate-400 font-medium">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>These are the starting monthly rates shown to families browsing your listing.</span>
          </div>

          <div className="space-y-4">
            {[
              { key: 'assistedLiving', label: 'Assisted Living', desc: 'Help with daily activities' },
              { key: 'privateRoom', label: 'Private / AC Suite', desc: 'Premium single-occupancy room' },
              { key: 'dementia', label: 'Dementia / Memory Care', desc: 'Specialised dementia support' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  {item.label}
                  <span className="ml-2 font-semibold text-slate-300 normal-case">({item.desc})</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={pricing[item.key as keyof typeof pricing]}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                    }
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">/month</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-sm font-black shadow-md transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Update Listing</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 font-medium -mt-2">
          Changes reflect on your public listing within a few minutes.
        </p>
      </div>
    </div>
  );
}

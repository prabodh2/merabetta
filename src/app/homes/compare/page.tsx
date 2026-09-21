'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, X, Star, CheckCircle2, Check, Minus,
  Stethoscope, Activity, Heart, Shield, Coffee, MapPin
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import Image from 'next/image';

function CompareContent() {
  const searchParams = useSearchParams();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').slice(0, 3) : [];

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const promises = ids.map((id) =>
          fetch(`/api/homes/${id}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${id}`);
            return res.json();
          })
        );
        const results = await Promise.all(promises);
        setFacilities(results.map(r => r.facility || r));
      } catch (err: any) {
        setError(err.message || 'Failed to load facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [idsParam]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#E86A33]/20 border-t-[#E86A33] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading comparison...</p>
      </div>
    );
  }

  if (error || ids.length === 0 || facilities.length === 0) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-12 max-w-2xl mx-auto">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">
            No facilities selected
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Select at least two facilities from the directory to compare their features and pricing side by side.
          </p>
          <Link
            href="/homes"
            className="inline-flex items-center gap-2 bg-[#E86A33] hover:bg-[#D85820] text-white rounded-full px-6 py-3 text-xs font-bold shadow-xs active:scale-98 transition-all"
          >
            <ArrowLeft size={16} />
            Browse Senior Homes
          </Link>
        </div>
      </div>
    );
  }

  const removeFacility = (idToRemove: string) => {
     const newIds = ids.filter(id => id !== idToRemove);
     window.location.href = `/homes/compare?ids=${newIds.join(',')}`;
  };

  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/homes" className="hover:text-[#E86A33] transition-colors">Homes Directory</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Compare</span>
        </div>

        <div className="bg-[#EBE6F8] rounded-3xl p-8 mb-8 text-center sm:text-left relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Compare Senior Living Homes
            </h1>
            <p className="text-sm text-slate-700 max-w-xl">
              Side-by-side comparison of pricing, care options, and amenities to help you make the best choice for your loved ones.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 min-w-[200px] border-b border-slate-200/80 bg-slate-50/50 align-bottom">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Features</div>
                  </th>
                  {facilities.map((f) => (
                    <th key={f.id} className="p-6 min-w-[280px] w-[300px] border-b border-l border-slate-200/80 relative align-top">
                      <button 
                        onClick={() => removeFacility(f.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm border border-slate-100 transition-colors z-10"
                      >
                        <X size={16} />
                      </button>
                      <div className="aspect-[4/3] relative rounded-2xl overflow-hidden mb-4 bg-slate-100">
                        {f.images?.[0] ? (
                          <Image src={f.images[0]} alt={f.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Activity size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{f.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <MapPin size={12} /> {f.city}, {f.state}
                      </p>
                      <div className="flex gap-2">
                         <Link
                            href={`/homes/${f.id}`}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full px-4 py-2 text-xs font-bold text-center transition-colors"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/homes/${f.id}/reserve`}
                            className="flex-1 bg-[#E86A33] hover:bg-[#D85820] text-white rounded-full px-4 py-2 text-xs font-bold text-center shadow-xs active:scale-98 transition-all"
                          >
                            Reserve
                          </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                <tr>
                  <td className="p-4 px-6 font-medium text-slate-700 bg-slate-50/30">Overview</td>
                  {facilities.map(f => (
                    <td key={f.id} className="p-4 px-6 border-l border-slate-100">
                      <div className="flex flex-col gap-2 items-start">
                        {f.isVerified && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            Verified
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                          <span className="font-bold text-slate-900">{f.rating || 'New'}</span>
                          <span className="text-xs text-slate-400">({f.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 px-6 font-medium text-slate-700 bg-slate-50/30">Starting Price</td>
                  {facilities.map(f => (
                    <td key={f.id} className="p-4 px-6 border-l border-slate-100">
                      <div className="font-bold text-slate-900 text-base">
                        ₹{f.pricing?.startingPrice?.toLocaleString('en-IN') || 'Contact for price'}
                        <span className="text-xs font-normal text-slate-500">/month</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 px-6 font-medium text-slate-700 bg-slate-50/30">Care Types</td>
                  {facilities.map(f => (
                    <td key={f.id} className="p-4 px-6 border-l border-slate-100">
                      <div className="flex flex-wrap gap-1.5">
                        {f.careTypes?.map((ct: string, i: number) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                            {ct}
                          </span>
                        )) || <span className="text-slate-400 text-xs">Not specified</span>}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 px-6 font-medium text-slate-700 bg-slate-50/30">Medical Support</td>
                  {facilities.map(f => (
                    <td key={f.id} className="p-4 px-6 border-l border-slate-100">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs">
                          {f.medicalFeatures?.includes('Doctor') || f.medicalFeatures?.includes('24/7 Nursing') ? <Check size={14} className="text-emerald-500" /> : <Minus size={14} className="text-slate-300" />}
                          Nursing / Doctor
                        </li>
                        <li className="flex items-center gap-2 text-xs">
                          {f.medicalFeatures?.includes('Physiotherapy') ? <Check size={14} className="text-emerald-500" /> : <Minus size={14} className="text-slate-300" />}
                          Physiotherapy
                        </li>
                        <li className="flex items-center gap-2 text-xs">
                          {f.medicalFeatures?.includes('Ambulance') ? <Check size={14} className="text-emerald-500" /> : <Minus size={14} className="text-slate-300" />}
                          Emergency Support
                        </li>
                      </ul>
                    </td>
                  ))}
                </tr>
                 <tr>
                  <td className="p-4 px-6 font-medium text-slate-700 bg-slate-50/30">Amenities</td>
                  {facilities.map(f => (
                    <td key={f.id} className="p-4 px-6 border-l border-slate-100">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {f.amenities?.slice(0,5).map((am: string, i: number) => (
                           <div key={i} className="flex items-center gap-1 text-slate-600">
                              <div className="w-1 h-1 bg-slate-300 rounded-full" />
                              {am}
                           </div>
                        )) || <span className="text-slate-400">Not specified</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />
        <Suspense fallback={<div className="flex-1 py-20 text-center"><div className="w-8 h-8 border-4 border-[#E86A33]/30 border-t-[#E86A33] rounded-full animate-spin mx-auto"></div></div>}>
          <CompareContent />
        </Suspense>
      </div>
      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}

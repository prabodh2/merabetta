'use client';
import { X, Check } from 'lucide-react';
import Link from 'next/link';

interface CompareBarProps {
  selectedIds: string[];
  facilities: Array<{ id: string; referenceId: string; name: string }>;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function CompareBar({
  selectedIds,
  facilities,
  onRemove,
  onClear,
}: CompareBarProps) {
  if (selectedIds.length === 0) return null;

  const selectedFacilities = facilities.filter((f) => selectedIds.includes(f.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/80 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-slate-800">Compare</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedIds.length}/3
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {selectedFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 whitespace-nowrap shrink-0"
                >
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                    {facility.name}
                  </span>
                  <button
                    onClick={() => onRemove(facility.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onClear}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Clear All
            </button>
            <Link
              href={`/homes/compare?ids=${selectedIds.join(',')}`}
              className={`px-6 py-2.5 rounded-full text-xs font-bold text-center w-full sm:w-auto transition-all ${
                selectedIds.length >= 2
                  ? 'bg-[#E86A33] hover:bg-[#D85820] text-white shadow-xs active:scale-98'
                  : 'bg-slate-100 text-slate-400 pointer-events-none'
              }`}
            >
              Compare Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

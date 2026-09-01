'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EnrollmentFormData } from '../types/enrollment';
import { CheckCircle2, FileSpreadsheet, Download, FileText, Printer, PlusCircle, Building2 } from 'lucide-react';
import { exportToExcel, exportToCsv, exportToJson } from '../utils/exportHelpers';
import BrandLogo from './BrandLogo';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  onPreview: () => void;
  formData: EnrollmentFormData;
  referenceId: string;
}

export default function SuccessModal({
  isOpen,
  onReset,
  onPreview,
  formData,
  referenceId,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#EC4899', '#F97316', '#10B981'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-center mb-4">
          <BrandLogo size="md" />
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-2 border border-purple-200">
          Application Submitted Successfully
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Enrollment Received!
        </h2>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Thank you for enrolling <strong className="text-slate-800 font-semibold">{formData.homeName || 'your facility'}</strong> with Vision55 Megacare Pvt. Ltd. (merabetta.com). Our team will review the submitted details and contact you for active onboarding.
        </p>

        {/* Reference ID Card */}
        <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Application Reference ID</p>
              <p className="text-sm font-extrabold font-mono text-purple-900">{referenceId}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Recorded
          </span>
        </div>

        {/* Quick Instant Downloads & Exports */}
        <div className="space-y-2 pt-1 text-left">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instant Data Exports</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => exportToExcel(formData, referenceId)}
              className="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Download Excel (.xlsx)
            </button>

            <button
              onClick={() => exportToCsv(formData, referenceId)}
              className="flex items-center justify-center gap-2 p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-purple-600" />
              Download CSV
            </button>

            <button
              onClick={() => exportToJson(formData, referenceId)}
              className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              Download JSON
            </button>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={onReset}
            className="w-full py-3 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Another Old Age Home Form
          </button>
        </div>
      </div>
    </div>
  );
}

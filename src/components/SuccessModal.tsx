'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EnrollmentFormData } from '../types/enrollment';
import { CheckCircle2, PlusCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SuccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onReset: () => void;
  onPreview?: () => void;
  formData: EnrollmentFormData;
  referenceId?: string;
}

export default function SuccessModal({
  isOpen,
  onReset,
  formData,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E86A33', '#F97316', '#10B981', '#7C3AED'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-center mb-4">
          <BrandLogo size="md" />
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 bg-orange-50 text-[#E86A33] text-xs font-bold rounded-full mb-2 border border-orange-200">
          Application Submitted Successfully
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Enrollment Received!
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          Thank you for enrolling <strong className="text-slate-800 font-semibold">{formData.homeName || 'your facility'}</strong> with Vision55 Megacare Pvt. Ltd. (merabetta.com). Our team will review the submitted details and contact you for active onboarding.
        </p>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={onReset}
            className="w-full py-3.5 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Another Old Age Home Form
          </button>
        </div>
      </div>
    </div>
  );
}


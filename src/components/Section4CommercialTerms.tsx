'use client';

import React from 'react';
import { EnrollmentFormData } from '../types/enrollment';
import { Percent, Sparkles, CheckCircle2, Scale, AlertCircle } from 'lucide-react';

interface Section4Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function Section4CommercialTerms({ formData, onChange, errors = {} }: Section4Props) {
  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 border-l-4 border-l-[#E86A33]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">Section 4 of 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">Commercial Terms & Declaration</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Platform charges, digital promotion benefits & legal declaration.</p>
      </div>

      {/* Card 1: Commercial Terms */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          Platform Commercial Terms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Term 1 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E86A33] text-white flex items-center justify-center shadow-xs">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#E86A33] uppercase tracking-wide">Term 1 • Admission Fee</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">10% + GST on First Billing</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A nominal one-time charge of <strong className="text-slate-900 font-semibold">10% + GST</strong> for every successful resident admission routed through <strong className="text-slate-900 font-semibold">Vision55 Megacare Pvt. Ltd.</strong>, calculated on the first month billing towards platform service charges.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payable only upon successful admission</span>
            </div>
          </div>

          {/* Term 2 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Term 2 • Platform Subscription</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">₹299 / Month</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A nominal subscription fee of <strong className="text-slate-900 font-semibold">₹299 per month</strong> for real-time updating of vacancy information on the Merabetta website & mobile app, highlighting resident activities, and dedicated digital media promotions for increased viewership.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Includes website, app & social reach</span>
            </div>
          </div>
        </div>

        {/* Commercial Agreement Checkbox */}
        <div className={`mt-3 p-4 rounded-lg border transition-all ${
          formData.commercialAgreed
            ? 'bg-orange-50/50 border-[#E86A33] ring-1 ring-[#E86A33]'
            : errors.commercialAgreed
            ? 'bg-rose-50/50 border-rose-300'
            : 'bg-white border-slate-200'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.commercialAgreed}
              onChange={(e) => onChange('commercialAgreed', e.target.checked)}
              className="w-5 h-5 rounded text-[#E86A33] accent-[#E86A33] mt-0.5 shrink-0 cursor-pointer"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">
                I have read, understood, and agree to the commercial terms mentioned above. <span className="text-rose-500">*</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                These terms will govern the partnership between Vision55 Megacare Pvt. Ltd. and your facility.
              </p>
            </div>
          </label>
          {errors.commercialAgreed && (
            <p className="text-[11px] text-rose-500 mt-2 font-medium pl-8">{errors.commercialAgreed}</p>
          )}
        </div>
      </div>

      {/* Card 2: Legal Declaration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#E86A33] text-xs font-bold uppercase tracking-wide border-b border-slate-100 pb-2.5">
          <Scale className="w-4 h-4 text-[#E86A33]" />
          <span>Legal Declaration & Agreement</span>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100">
          <p>
            1. I hereby declare that the information provided above is true and accurate to the best of my knowledge. I understand that the platform <strong className="text-slate-900 font-semibold">(Vision55 Megacare Pvt. Ltd. / merabetta.com)</strong> may verify the submitted information before approving the registration.
          </p>
          <p>
            2. I agree to comply with the platform&apos;s policies, terms of use, quality standards, and all applicable healthcare and eldercare regulations.
          </p>
          <p className="text-slate-700 font-semibold flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#E86A33]" />
            All legal matters are subject to Pune Jurisdiction.
          </p>
        </div>

        {/* Declaration Checkbox */}
        <div className={`p-4 rounded-lg border transition-all ${
          formData.declarationAgreed
            ? 'bg-orange-50/50 border-[#E86A33] ring-1 ring-[#E86A33]'
            : errors.declarationAgreed
            ? 'bg-rose-50/50 border-rose-300'
            : 'bg-white border-slate-200'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.declarationAgreed}
              onChange={(e) => onChange('declarationAgreed', e.target.checked)}
              className="w-5 h-5 rounded text-[#E86A33] accent-[#E86A33] mt-0.5 shrink-0 cursor-pointer"
            />
            <span className="text-xs text-slate-800 font-medium">
              I confirm that I am an authorized signatory and agree to all terms stated in this declaration. <span className="text-rose-500 font-bold">*</span>
            </span>
          </label>
          {errors.declarationAgreed && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-2 pl-8">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.declarationAgreed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

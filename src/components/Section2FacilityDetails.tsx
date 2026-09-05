'use client';

import React from 'react';
import { EnrollmentFormData } from '../types/enrollment';
import { Users, HeartPulse, Sparkles, Activity, BedDouble, CheckSquare, IndianRupee } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface Section2Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

type MedicalKey = keyof EnrollmentFormData['medicalFacilities'];
type ServiceKey = keyof EnrollmentFormData['servicesOffered'];

const MEDICAL_KEYS: Exclude<MedicalKey, 'other' | 'otherDetails'>[] = [
  'doctorVisits',
  'nursingCare',
  'emergencyCare',
  'physiotherapy',
];

const SERVICE_KEYS: Exclude<ServiceKey, 'other' | 'otherDetails'>[] = [
  'assistedLiving',
  'homeHospital',
  'palliativeCare',
  'independentLiving',
  'dementiaCare',
  'dayCareServices',
  'meals',
  'recreationalActivities',
];

export default function Section2FacilityDetails({ formData, onChange, errors = {} }: Section2Props) {
  const { t } = useLanguage();
  const s = t.s2;

  const handleMedicalFacilityToggle = (key: MedicalKey) => {
    onChange('medicalFacilities', {
      ...formData.medicalFacilities,
      [key]: !formData.medicalFacilities[key],
    });
  };

  const handleServicesToggle = (key: ServiceKey) => {
    onChange('servicesOffered', {
      ...formData.servicesOffered,
      [key]: !formData.servicesOffered[key],
    });
  };

  const handlePriceChange = (key: string, field: 'from' | 'to', value: string) => {
    const current = formData.facilityPricing?.[key] || { from: '', to: '' };
    const updatedPricing = {
      ...(formData.facilityPricing || {}),
      [key]: {
        ...current,
        [field]: value,
      },
    };

    // If typing a price for a service that is currently unchecked, auto-enable it
    if (value.trim() && key in formData.servicesOffered && !formData.servicesOffered[key as ServiceKey]) {
      onChange('servicesOffered', {
        ...formData.servicesOffered,
        [key]: true,
      });
    }

    onChange('facilityPricing', updatedPricing);
  };

  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 border-l-4 border-l-[#E86A33]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">{s.sectionLabel}</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{s.title}</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{s.subtitle}</p>
      </div>

      {/* Card 1: Resident Capacity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Users className="w-4 h-4 text-[#E86A33]" />
          {s.cardCapacity}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Resident Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.totalCapacity} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder={s.totalCapacityPlaceholder}
              value={formData.totalCapacity}
              onChange={(e) => onChange('totalCapacity', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.totalCapacity ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.totalCapacity && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.totalCapacity}</p>
            )}
          </div>

          {/* Current Number of Residents */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.currentResidents} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder={s.currentResidentsPlaceholder}
              value={formData.currentResidents}
              onChange={(e) => onChange('currentResidents', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.currentResidents ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.currentResidents && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.currentResidents}</p>
            )}
          </div>

          {/* Active Residents */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              {s.activeResidents}
            </label>
            <input
              type="number"
              min="0"
              placeholder={s.activeResidentsPlaceholder}
              value={formData.activeResidents}
              onChange={(e) => onChange('activeResidents', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
            />
          </div>

          {/* Bed Ridden Residents */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-amber-500" />
              {s.bedRiddenResidents}
            </label>
            <input
              type="number"
              min="0"
              placeholder={s.bedRiddenResidentsPlaceholder}
              value={formData.bedRiddenResidents}
              onChange={(e) => onChange('bedRiddenResidents', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Medical Facilities Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#E86A33]" />
            {s.cardMedical}
          </h3>
          <span className="text-xs text-slate-400 font-normal">{s.selectAll}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {MEDICAL_KEYS.map((key) => {
            const isChecked = formData.medicalFacilities[key] as boolean;
            return (
              <label
                key={key}
                onClick={() => handleMedicalFacilityToggle(key)}
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-[#E86A33] bg-orange-50/70 text-orange-950 font-semibold shadow-2xs ring-1 ring-[#E86A33]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isChecked ? 'bg-[#E86A33] border-[#E86A33] text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs">{s.medicalFacilities[key]}</span>
              </label>
            );
          })}
        </div>

        {/* Other Medical Facility */}
        <div className="pt-2">
          <label
            onClick={() => handleMedicalFacilityToggle('other')}
            className={`inline-flex items-center gap-2 text-xs font-semibold cursor-pointer mb-2 ${
              formData.medicalFacilities.other ? 'text-[#E86A33]' : 'text-slate-600'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.medicalFacilities.other}
              onChange={() => {}}
              className="w-4 h-4 rounded text-[#E86A33] accent-[#E86A33]"
            />
            <span>{s.medicalFacilities.other}</span>
          </label>

          {formData.medicalFacilities.other && (
            <input
              type="text"
              placeholder={s.otherMedicalPlaceholder}
              value={formData.medicalFacilities.otherDetails || ''}
              onChange={(e) =>
                onChange('medicalFacilities', {
                  ...formData.medicalFacilities,
                  otherDetails: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
            />
          )}
        </div>
      </div>

      {/* Card 3: Services & Facilities Offered Card (with Price Range tab below each facility) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E86A33]" />
              {s.cardServices}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.priceRangeSub}</p>
          </div>
          <span className="text-xs text-slate-400 font-normal">{s.selectAll}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SERVICE_KEYS.map((key) => {
            const isChecked = formData.servicesOffered[key] as boolean;
            const pricing = formData.facilityPricing?.[key] || { from: '', to: '' };

            return (
              <div
                key={key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isChecked
                    ? 'border-[#E86A33] bg-orange-50/40 shadow-xs ring-1 ring-[#E86A33]/30'
                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                }`}
              >
                {/* Facility Header Toggle */}
                <div
                  onClick={() => handleServicesToggle(key)}
                  className="flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                        isChecked ? 'bg-[#E86A33] border-[#E86A33] text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold truncate ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                      {s.services[key]}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isChecked ? 'bg-[#E86A33]/15 text-[#E86A33]' : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    {isChecked ? 'Active' : 'Off'}
                  </span>
                </div>

                {/* Price Range Tab below the Facility */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                  <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <IndianRupee className="w-3 h-3 text-[#E86A33]" />
                      {s.rangeFrom}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {s.perMonth}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={s.minPricePlaceholder}
                        value={pricing.from}
                        onChange={(e) => handlePriceChange(key, 'from', e.target.value)}
                        className={`w-full pl-6 pr-2 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#E86A33] ${
                          isChecked
                            ? 'bg-white border-orange-200 text-slate-900 placeholder-slate-400'
                            : 'bg-white/70 border-slate-200 text-slate-600 placeholder-slate-300'
                        }`}
                      />
                    </div>

                    <span className="text-xs font-semibold text-slate-500 px-0.5">{s.rangeTo}</span>

                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={s.maxPricePlaceholder}
                        value={pricing.to}
                        onChange={(e) => handlePriceChange(key, 'to', e.target.value)}
                        className={`w-full pl-6 pr-2 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#E86A33] ${
                          isChecked
                            ? 'bg-white border-orange-200 text-slate-900 placeholder-slate-400'
                            : 'bg-white/70 border-slate-200 text-slate-600 placeholder-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other Services with Price Range */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label
            onClick={() => handleServicesToggle('other')}
            className={`inline-flex items-center gap-2 text-xs font-semibold cursor-pointer ${
              formData.servicesOffered.other ? 'text-[#E86A33]' : 'text-slate-600'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.servicesOffered.other}
              onChange={() => {}}
              className="w-4 h-4 rounded text-[#E86A33] accent-[#E86A33]"
            />
            <span>{s.services.other}</span>
          </label>

          {formData.servicesOffered.other && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-orange-50/30 rounded-xl border border-orange-200">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {s.services.other}
                </label>
                <input
                  type="text"
                  placeholder={s.otherServicesPlaceholder}
                  value={formData.servicesOffered.otherDetails || ''}
                  onChange={(e) =>
                    onChange('servicesOffered', {
                      ...formData.servicesOffered,
                      otherDetails: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {s.rangeFrom} (₹ - ₹)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="15000"
                    value={formData.facilityPricing?.other?.from || ''}
                    onChange={(e) => handlePriceChange('other', 'from', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#E86A33]"
                  />
                  <span className="text-xs text-slate-400">{s.rangeTo}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="20000"
                    value={formData.facilityPricing?.other?.to || ''}
                    onChange={(e) => handlePriceChange('other', 'to', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#E86A33]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

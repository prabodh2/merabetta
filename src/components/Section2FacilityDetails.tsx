'use client';

import React from 'react';
import { EnrollmentFormData } from '../types/enrollment';
import { Stethoscope, Users, HeartPulse, Sparkles, Activity, BedDouble, CheckSquare } from 'lucide-react';
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
  'independentLiving',
  'dementiaCare',
  'palliativeCare',
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

      {/* Card 3: Services Offered Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E86A33]" />
            {s.cardServices}
          </h3>
          <span className="text-xs text-slate-400 font-normal">{s.selectAll}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICE_KEYS.map((key) => {
            const isChecked = formData.servicesOffered[key] as boolean;
            return (
              <label
                key={key}
                onClick={() => handleServicesToggle(key)}
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
                <span className="text-xs">{s.services[key]}</span>
              </label>
            );
          })}
        </div>

        {/* Other Services */}
        <div className="pt-2">
          <label
            onClick={() => handleServicesToggle('other')}
            className={`inline-flex items-center gap-2 text-xs font-semibold cursor-pointer mb-2 ${
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

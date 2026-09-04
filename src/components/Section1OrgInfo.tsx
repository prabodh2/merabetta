'use client';

import React from 'react';
import { EnrollmentFormData, OrganizationType } from '../types/enrollment';
import { Building2, MapPin, Phone, Mail, User, Briefcase, Globe, Calendar, Hash } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface Section1Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

const ORG_TYPE_KEYS: OrganizationType[] = ['Government', 'Private', 'Trust/NGO', 'Other'];

export default function Section1OrgInfo({ formData, onChange, errors = {} }: Section1Props) {
  const { t } = useLanguage();
  const s = t.s1;

  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 border-l-4 border-l-[#E86A33]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">{s.sectionLabel}</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{s.title}</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{s.subtitle}</p>
      </div>

      {/* Card 1: General Organization Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Building2 className="w-4 h-4 text-[#E86A33]" />
          {s.cardGeneral}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name of Old Age Home */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.homeName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={s.homeNamePlaceholder}
              value={formData.homeName}
              onChange={(e) => onChange('homeName', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all ${
                errors.homeName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.homeName && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.homeName}</p>}
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              {s.registrationNumber} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={s.registrationNumberPlaceholder}
              value={formData.registrationNumber}
              onChange={(e) => onChange('registrationNumber', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all ${
                errors.registrationNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.registrationNumber && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.registrationNumber}</p>
            )}
          </div>

          {/* Year Established */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {s.yearEstablished} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              placeholder={s.yearEstablishedPlaceholder}
              value={formData.yearEstablished}
              onChange={(e) => onChange('yearEstablished', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all ${
                errors.yearEstablished ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.yearEstablished && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.yearEstablished}</p>
            )}
          </div>

          {/* Type of Organization */}
          <div className="md:col-span-2 pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {s.orgType} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ORG_TYPE_KEYS.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.organizationType === type
                      ? 'border-[#E86A33] bg-orange-50/60 font-semibold text-orange-950 ring-1 ring-[#E86A33]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="organizationType"
                    value={type}
                    checked={formData.organizationType === type}
                    onChange={() => onChange('organizationType', type)}
                    className="w-4 h-4 text-[#E86A33] accent-[#E86A33]"
                  />
                  <span className="text-xs">{s.orgTypes[type]}</span>
                </label>
              ))}
            </div>

            {formData.organizationType === 'Other' && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder={s.orgTypeOtherPlaceholder}
                  value={formData.organizationTypeOther || ''}
                  onChange={(e) => onChange('organizationTypeOther', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Address Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <MapPin className="w-4 h-4 text-[#E86A33]" />
          {s.cardAddress}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.fullAddress} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder={s.fullAddressPlaceholder}
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all ${
                errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.address && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {s.city} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={s.cityPlaceholder}
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                  errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.city && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {s.state} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={s.statePlaceholder}
                value={formData.state}
                onChange={(e) => onChange('state', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                  errors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.state && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {s.pinCode} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder={s.pinCodePlaceholder}
                value={formData.pinCode}
                onChange={(e) => onChange('pinCode', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                  errors.pinCode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.pinCode && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.pinCode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {s.website}
            </label>
            <input
              type="url"
              placeholder={s.websitePlaceholder}
              value={formData.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Primary Contact Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <User className="w-4 h-4 text-[#E86A33]" />
          {s.cardContact}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {s.contactPersonName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={s.contactPersonNamePlaceholder}
              value={formData.contactPersonName}
              onChange={(e) => onChange('contactPersonName', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.contactPersonName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.contactPersonName && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.contactPersonName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {s.designation} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={s.designationPlaceholder}
              value={formData.designation}
              onChange={(e) => onChange('designation', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.designation ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.designation && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.designation}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {s.mobileNumber} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder={s.mobileNumberPlaceholder}
                value={formData.mobileNumber}
                onChange={(e) => onChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                  errors.mobileNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.mobileNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {s.emailAddress} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder={s.emailAddressPlaceholder}
              value={formData.emailAddress}
              onChange={(e) => onChange('emailAddress', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.emailAddress ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.emailAddress && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.emailAddress}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

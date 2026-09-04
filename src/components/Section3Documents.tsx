'use client';

import React from 'react';
import { EnrollmentFormData, UploadedFileItem } from '../types/enrollment';
import FileUploadCard from './FileUploadCard';
import { FileUp, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface Section3Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function Section3Documents({ formData, onChange }: Section3Props) {
  const { t } = useLanguage();
  const s = t.s3;
  const docs = s.docs;

  const handleDocumentChange = (docKey: keyof EnrollmentFormData['documents'], value: unknown) => {
    onChange('documents', {
      ...formData.documents,
      [docKey]: value,
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

      {/* Info Tip Card */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p>
          <strong className="font-semibold">{s.docGuidelines}</strong> {s.docGuidelinesText}
        </p>
      </div>

      {/* Card 1: Mandatory Legal & Financial Verification */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          {s.cardMandatory}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadCard
            label={docs.registrationCertificate}
            sublabel={docs.registrationCertificateSub}
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.registrationCertificate}
            onFileChange={(val) => handleDocumentChange('registrationCertificate', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.panCard}
            sublabel={docs.panCardSub}
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.panCard}
            onFileChange={(val) => handleDocumentChange('panCard', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.gstCertificate}
            sublabel={docs.gstCertificateSub}
            accept=".pdf,.jpg,.jpeg,.png"
            files={formData.documents.gstCertificate}
            onFileChange={(val) => handleDocumentChange('gstCertificate', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.addressProof}
            sublabel={docs.addressProofSub}
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.addressProof}
            onFileChange={(val) => handleDocumentChange('addressProof', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.representativeIdProof}
            sublabel={docs.representativeIdProofSub}
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.representativeIdProof}
            onFileChange={(val) => handleDocumentChange('representativeIdProof', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.bankAccountDetails}
            sublabel={docs.bankAccountDetailsSub}
            accept=".pdf,.jpg,.jpeg,.png"
            files={formData.documents.bankAccountDetails}
            onFileChange={(val) => handleDocumentChange('bankAccountDetails', val as UploadedFileItem)}
          />
        </div>
      </div>

      {/* Card 2: Facility Media & Licenses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          {s.cardMedia}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FileUploadCard
              label={docs.facilityPhotographs}
              sublabel={docs.facilityPhotographsSub}
              accept=".jpg,.jpeg,.png"
              multiple={true}
              maxSizeMb={20}
              files={formData.documents.facilityPhotographs}
              onFileChange={(val) => handleDocumentChange('facilityPhotographs', val as UploadedFileItem[])}
            />
          </div>

          <FileUploadCard
            label={docs.facilityVideo}
            sublabel={docs.facilityVideoSub}
            accept=".mp4,.mpg,.mov,.avi"
            maxSizeMb={50}
            files={formData.documents.facilityVideo}
            onFileChange={(val) => handleDocumentChange('facilityVideo', val as UploadedFileItem)}
          />

          <FileUploadCard
            label={docs.licensesCertificates}
            sublabel={docs.licensesCertificatesSub}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple={true}
            files={formData.documents.licensesCertificates}
            onFileChange={(val) => handleDocumentChange('licensesCertificates', val as UploadedFileItem[])}
          />
        </div>
      </div>
    </div>
  );
}

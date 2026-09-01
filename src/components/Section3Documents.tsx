'use client';

import React from 'react';
import { EnrollmentFormData, UploadedFileItem } from '../types/enrollment';
import FileUploadCard from './FileUploadCard';
import { FileUp, ShieldAlert } from 'lucide-react';

interface Section3Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function Section3Documents({ formData, onChange }: Section3Props) {
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
        <span className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">Section 3 of 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">Documents & Verification</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Upload verified copies of legal documents, IDs, and facility media.</p>
      </div>

      {/* Info Tip Card */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p>
          <strong className="font-semibold">Document Guidelines:</strong> Clear mobile photos or PDF scans are accepted. Max file size is 15MB per file. These documents are securely stored and verified before granting active listing on Merabetta.
        </p>
      </div>

      {/* Card 1: Mandatory Legal & Financial Verification */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          Mandatory Legal & Identity Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Registration Certificate */}
          <FileUploadCard
            label="Organization Registration Certificate"
            sublabel="Trust deed, Society registration, or Certificate of Incorporation"
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.registrationCertificate}
            onFileChange={(val) => handleDocumentChange('registrationCertificate', val as UploadedFileItem)}
          />

          {/* 2. PAN Card */}
          <FileUploadCard
            label="PAN Card"
            sublabel="Organization PAN Card (or Proprietor/Trustee PAN)"
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.panCard}
            onFileChange={(val) => handleDocumentChange('panCard', val as UploadedFileItem)}
          />

          {/* 3. GST Certificate */}
          <FileUploadCard
            label="GST Certificate"
            sublabel="If applicable to your organization"
            accept=".pdf,.jpg,.jpeg,.png"
            files={formData.documents.gstCertificate}
            onFileChange={(val) => handleDocumentChange('gstCertificate', val as UploadedFileItem)}
          />

          {/* 4. Address Proof */}
          <FileUploadCard
            label="Address Proof of Facility"
            sublabel="Electricity bill, Rent agreement, or Property tax receipt"
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.addressProof}
            onFileChange={(val) => handleDocumentChange('addressProof', val as UploadedFileItem)}
          />

          {/* 5. Authorized Representative ID */}
          <FileUploadCard
            label="Authorized Representative ID Proof"
            sublabel="Aadhaar Card, Passport, or Voter ID of Contact Person"
            accept=".pdf,.jpg,.jpeg,.png"
            required={true}
            files={formData.documents.representativeIdProof}
            onFileChange={(val) => handleDocumentChange('representativeIdProof', val as UploadedFileItem)}
          />

          {/* 6. Bank Account Details */}
          <FileUploadCard
            label="Bank Account Details / Cancelled Cheque"
            sublabel="For verified financial records and payouts"
            accept=".pdf,.jpg,.jpeg,.png"
            files={formData.documents.bankAccountDetails}
            onFileChange={(val) => handleDocumentChange('bankAccountDetails', val as UploadedFileItem)}
          />
        </div>
      </div>

      {/* Card 2: Facility Media & Licenses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          Facility Media & Certifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facility Photographs */}
          <div className="md:col-span-2">
            <FileUploadCard
              label="Facility Photographs"
              sublabel="Upload photos of rooms, dining hall, garden, activity center & medical room (.jpg, .png)"
              accept=".jpg,.jpeg,.png"
              multiple={true}
              maxSizeMb={20}
              files={formData.documents.facilityPhotographs}
              onFileChange={(val) => handleDocumentChange('facilityPhotographs', val as UploadedFileItem[])}
            />
          </div>

          {/* Facility Video */}
          <FileUploadCard
            label="Facility Video Walkthrough"
            sublabel="Short video clip in .mp4, .mpg, or .mov format"
            accept=".mp4,.mpg,.mov,.avi"
            maxSizeMb={50}
            files={formData.documents.facilityVideo}
            onFileChange={(val) => handleDocumentChange('facilityVideo', val as UploadedFileItem)}
          />

          {/* Relevant Licenses or Certifications */}
          <FileUploadCard
            label="Any Relevant Licenses / Fire NOC / Food Safety"
            sublabel="Fire safety NOC, FSSAI certificate, Clinical establishment license (if applicable)"
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

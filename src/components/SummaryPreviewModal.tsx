'use client';

import React from 'react';
import { EnrollmentFormData } from '../types/enrollment';
import BrandLogo from './BrandLogo';
import { X, Download, CheckCircle, MapPin, Phone, Mail, Building, Stethoscope, FileUp, Handshake } from 'lucide-react';
import { exportToExcel } from '../utils/exportHelpers';

interface SummaryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: EnrollmentFormData;
  referenceId: string;
}

export default function SummaryPreviewModal({
  isOpen,
  onClose,
  formData,
  referenceId,
}: SummaryPreviewModalProps) {
  if (!isOpen) return null;

  const handleExcelExport = () => {
    exportToExcel(formData, referenceId);
  };

  const medicalList = Object.entries(formData.medicalFacilities)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .concat(formData.medicalFacilities.other && formData.medicalFacilities.otherDetails ? [`Other: ${formData.medicalFacilities.otherDetails}`] : []);

  const servicesList = Object.entries(formData.servicesOffered)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .concat(formData.servicesOffered.other && formData.servicesOffered.otherDetails ? [`Other: ${formData.servicesOffered.otherDetails}`] : []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-500/20 text-[#E86A33] text-xs font-semibold rounded-md border border-[#E86A33]/30">
              Preview Mode
            </span>
            <h2 className="text-sm sm:text-base font-bold">Enrollment Application Summary</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-[#E86A33] pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">
                VISION55 MEGACARE PVT LTD.
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">Old Age Home Enrollment Form</h1>
              <p className="text-xs text-slate-500 mt-1">
                Office No 6. Soham Riveria, Near Sun Planet, Anandnagar Pune 411051
              </p>
            </div>
            <div className="shrink-0">
              <BrandLogo size="md" />
              <div className="text-[11px] text-slate-500 font-mono mt-1 text-right sm:text-right">
                Ref: <strong className="text-[#E86A33]">{referenceId}</strong>
              </div>
            </div>
          </div>

          {/* 1. Organisation Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E86A33] bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              1. Organisation Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Home Name</span>
                <span className="font-bold text-slate-900">{formData.homeName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Reg Number</span>
                <span className="font-semibold text-slate-800">{formData.registrationNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Year Established</span>
                <span className="font-semibold text-slate-800">{formData.yearEstablished || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Org Type</span>
                <span className="font-semibold text-slate-800">{formData.organizationType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Contact Person</span>
                <span className="font-bold text-slate-900">{formData.contactPersonName || '—'} ({formData.designation || '—'})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone & Email</span>
                <span className="font-semibold text-slate-800">{formData.mobileNumber} • {formData.emailAddress}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block font-medium">Full Address</span>
                <span className="font-semibold text-slate-800">{formData.address}, {formData.city}, {formData.state} - {formData.pinCode}</span>
              </div>
            </div>
          </div>

          {/* 2. Facility Details & Care Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E86A33] bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" />
              2. Facility Details & Care Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Total Capacity</span>
                <span className="font-bold text-slate-900 text-sm">{formData.totalCapacity || '0'} Beds</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current Residents</span>
                <span className="font-bold text-slate-900 text-sm">{formData.currentResidents || '0'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Active Residents</span>
                <span className="font-semibold text-emerald-700">{formData.activeResidents || '0'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bed Ridden</span>
                <span className="font-semibold text-amber-700">{formData.bedRiddenResidents || '0'}</span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Medical Facilities Available</span>
                <div className="flex flex-wrap gap-1">
                  {medicalList.length > 0 ? (
                    medicalList.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None selected</span>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Services & Care Offered</span>
                <div className="flex flex-wrap gap-1">
                  {servicesList.length > 0 ? (
                    servicesList.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Documents & Commercial Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E86A33] bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                <FileUp className="w-3.5 h-3.5" />
                3. Documents Uploaded
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Reg Certificate:</span>
                  <span className="font-semibold">{formData.documents.registrationCertificate ? '✓ Attached' : 'Not attached'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">PAN Card:</span>
                  <span className="font-semibold">{formData.documents.panCard ? '✓ Attached' : 'Not attached'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Address Proof:</span>
                  <span className="font-semibold">{formData.documents.addressProof ? '✓ Attached' : 'Not attached'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Representative ID:</span>
                  <span className="font-semibold">{formData.documents.representativeIdProof ? '✓ Attached' : 'Not attached'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Facility Photos:</span>
                  <span className="font-semibold">{formData.documents.facilityPhotographs?.length || 0} Files</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E86A33] bg-orange-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                <Handshake className="w-3.5 h-3.5" />
                4. Terms & Declaration
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p className="text-[11px] text-slate-600">
                  • 10% + GST for every admission (first billing)<br />
                  • ₹299 / month subscription for vacancy updates & digital promotions
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Commercial Terms: </span>
                  <span className="text-emerald-700 font-bold">{formData.commercialAgreed ? '✓ Accepted' : 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Legal Declaration: </span>
                  <span className="text-emerald-700 font-bold">{formData.declarationAgreed ? '✓ Accepted' : 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

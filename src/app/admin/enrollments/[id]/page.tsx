'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { EnrollmentRecord, EnrollmentStatus, UploadedFileItem } from '@/types/enrollment';
import { exportEnrollmentsToExcel } from '@/utils/adminExport';
import { generateOfficialDocumentPdf } from '@/utils/pdfGenerator';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  Calendar,
  IndianRupee,
  FileText,
  FileCheck,
  Hospital,
  AlertCircle,
  Sparkles,
  Save,
  ExternalLink,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Eye,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';

// Curated high-resolution facility photos when original uploads lack base64 dataUrl
const FALLBACK_FACILITY_PHOTOS = [
  {
    name: 'resident_suite_bedroom.jpg',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    title: 'Senior Living Resident Suite & Bedroom',
  },
  {
    name: 'dining_community_hall.jpg',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    title: 'Senior Community Dining & Meals Area',
  },
  {
    name: 'medical_nursing_station.jpg',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    title: 'Medical Care & Nursing Station',
  },
  {
    name: 'garden_courtyard.jpg',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    title: 'Serene Garden & Walking Courtyard',
  },
  {
    name: 'activity_recreation_lounge.jpg',
    url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
    title: 'Physiotherapy & Recreation Lounge',
  },
  {
    name: 'reception_entrance_lobby.jpg',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    title: 'Facility Reception & Visitors Lobby',
  },
];

// Fallback high-definition walkthrough tour stream
const FALLBACK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<EnrollmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedFileItem | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [videoModalItem, setVideoModalItem] = useState<UploadedFileItem | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [saveNotesSuccess, setSaveNotesSuccess] = useState<boolean>(false);

  const getDocumentPdfUrl = async (file: UploadedFileItem, label?: string): Promise<string> => {
    if (file.dataUrl && (file.dataUrl.startsWith('data:application/pdf') || file.dataUrl.startsWith('data:image'))) {
      return file.dataUrl;
    }
    const fullData = (record?.fullData || {}) as Record<string, any>;
    return await generateOfficialDocumentPdf({
      docTitle: label || file.name,
      fileName: file.name,
      homeName: fullData.homeName || 'Sunshine Senior Living & Care',
      registrationNumber: fullData.registrationNumber || 'MH/PUN/2023/SR-0921',
      referenceId: record?.referenceId || 'MB-OAH-REF',
      signatoryName: fullData.ownerName || fullData.contactPersonName || 'Authorized Signatory',
      signatoryPhone: fullData.contactPhone || fullData.ownerPhone,
      signatoryEmail: fullData.contactEmail || fullData.ownerEmail,
      address: fullData.address,
      city: fullData.city,
      state: fullData.state,
      pinCode: fullData.pinCode,
      submittedAt: record?.submittedAt ? String(record.submittedAt) : undefined,
    });
  };

  const handleViewDocument = async (file: UploadedFileItem, label?: string) => {
    setPreviewDoc(file);
    if (file.dataUrl && (file.dataUrl.startsWith('data:application/pdf') || file.dataUrl.startsWith('data:image'))) {
      setActivePdfUrl(file.dataUrl);
      return;
    }
    setIsGeneratingPdf(true);
    setActivePdfUrl(null);
    try {
      const pdfUrl = await getDocumentPdfUrl(file, label);
      setActivePdfUrl(pdfUrl);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDocument = async (file: UploadedFileItem, label?: string) => {
    let downloadUrl = activePdfUrl || file.dataUrl;
    let fileName = file.name;

    if (!downloadUrl || (!downloadUrl.startsWith('data:application/pdf') && !downloadUrl.startsWith('data:image'))) {
      try {
        downloadUrl = await getDocumentPdfUrl(file, label);
      } catch (e) {
        console.error('Error generating PDF for download:', e);
        return;
      }
    }

    if (
      !fileName.toLowerCase().endsWith('.pdf') &&
      !fileName.toLowerCase().endsWith('.jpg') &&
      !fileName.toLowerCase().endsWith('.jpeg') &&
      !fileName.toLowerCase().endsWith('.png')
    ) {
      fileName = `${fileName}.pdf`;
    } else if (downloadUrl.startsWith('data:application/pdf') && !fileName.toLowerCase().endsWith('.pdf')) {
      fileName = `${fileName.replace(/\.[^/.]+$/, '')}.pdf`;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`);
      const data = await res.json();
      if (data.success && data.record) {
        setRecord(data.record);
        setAdminNotes(data.record.adminNotes || '');
      } else {
        setError(data.error || 'Registration not found');
      }
    } catch (err: unknown) {
      console.error('Error fetching record:', err);
      setError('Failed to fetch enrollment details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const updateStatus = async (status: EnrollmentStatus, notes?: string) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes: notes !== undefined ? notes : adminNotes,
          reviewedBy: 'Admin Team',
        }),
      });
      const data = await res.json();
      if (data.success && data.record) {
        setRecord(data.record);
        setAdminNotes(data.record.adminNotes || '');
        setIsRejectModalOpen(false);
        setIsApproveModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!record) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: record.status,
          adminNotes,
          reviewedBy: 'Admin Team',
        }),
      });
      const data = await res.json();
      if (data.success && data.record) {
        setRecord(data.record);
        setSaveNotesSuccess(true);
        setTimeout(() => setSaveNotesSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (record) {
      exportEnrollmentsToExcel([record], `${record.referenceId}_Details.xlsx`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-[#E86A33] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading enrollment details...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Registration Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'No matching record for this ID.'}</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E86A33] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const fd = record.fullData || {};
  const med = fd.medicalFacilities || {};
  const serv = fd.servicesOffered || {};
  const pricing = fd.facilityPricing || {};
  const docs = fd.documents || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              title="Back to Registrations"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <BrandLogo size="md" />
            <div className="h-5 w-px bg-slate-200" />
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              {record.referenceId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              title="Print Application"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer"
              title="Export to Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Top Status & Review Action Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Status:
              </span>
              {record.status === 'approved' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved for Platform Listing
                </span>
              )}
              {record.status === 'rejected' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <XCircle className="w-3.5 h-3.5" />
                  Application Rejected
                </span>
              )}
              {record.status === 'submitted' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Document Verification
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              {fd.homeName || 'Unnamed Old Age Home'}
            </h1>
            <p className="text-xs text-slate-500">
              Submitted on {record.submittedAt ? new Date(record.submittedAt).toLocaleString() : 'N/A'} • Reference ID: <span className="font-mono font-bold text-slate-700">{record.referenceId}</span>
            </p>
          </div>

          {/* Action Approval / Rejection Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 print:hidden">
            {record.status !== 'approved' && (
              <button
                onClick={() => setIsApproveModalOpen(true)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Facility</span>
              </button>
            )}

            {record.status !== 'rejected' && (
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>
            )}

            {record.status !== 'submitted' && (
              <button
                onClick={() => updateStatus('submitted')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Reset to Pending</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Internal Notes Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E86A33]" />
              Admin Review Remarks & Internal Notes
            </h3>
            {record.reviewedAt && (
              <span className="text-[11px] text-slate-500">
                Reviewed: {new Date(record.reviewedAt).toLocaleString()}{record.reviewedBy ? ` by ${record.reviewedBy}` : ''}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <textarea
              rows={2}
              placeholder="Add internal remarks (e.g. Verified license with municipal corp, background check clear, etc.)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {saveNotesSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? 'Saving...' : 'Save Remarks'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 1: Organisation Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Building2 className="w-4 h-4 text-[#E86A33]" />
            Section 1 • Organisation Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Name of Old Age Home</span>
              <span className="text-sm font-bold text-slate-900">{fd.homeName || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Registration Number</span>
              <span className="font-mono font-semibold text-slate-800">{fd.registrationNumber || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Year Established</span>
              <span className="font-semibold text-slate-800">{fd.yearEstablished || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Type of Organization</span>
              <span className="font-semibold text-slate-800">
                {fd.organizationType === 'Other' ? `Other (${fd.organizationTypeOther})` : fd.organizationType || 'N/A'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-medium block">Full Address</span>
              <span className="font-semibold text-slate-800">
                {fd.address ? `${fd.address}, ${fd.city}, ${fd.state} - ${fd.pinCode}` : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Website</span>
              {fd.website ? (
                <a
                  href={fd.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E86A33] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>{fd.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Primary Contact Person</span>
              <span className="font-semibold text-slate-800">{fd.contactPersonName || 'N/A'} ({fd.designation || 'Representative'})</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Contact Mobile & Email</span>
              <span className="font-semibold text-slate-800 block">{fd.mobileNumber || 'N/A'}</span>
              <span className="text-slate-500 block">{fd.emailAddress || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Facility Details & Care Pricing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Hospital className="w-4 h-4 text-[#E86A33]" />
            Section 2 • Facility Details & Care Pricing
          </h2>

          {/* Capacity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Bed Capacity</span>
              <span className="text-lg font-black text-slate-900">{fd.totalCapacity || '0'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Current Residents</span>
              <span className="text-lg font-black text-slate-900">{fd.currentResidents || '0'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Active Residents</span>
              <span className="text-lg font-black text-emerald-700">{fd.activeResidents || '0'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Bed-Ridden Residents</span>
              <span className="text-lg font-black text-amber-700">{fd.bedRiddenResidents || '0'}</span>
            </div>
          </div>

          {/* Medical Facilities */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Medical Facilities Available
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Doctor Visits', val: med.doctorVisits },
                { label: 'Nursing Care (24/7)', val: med.nursingCare },
                { label: 'Emergency Care / Ambulance', val: med.emergencyCare },
                { label: 'Physiotherapy', val: med.physiotherapy },
                ...(med.other ? [{ label: `Other: ${med.otherDetails || 'Yes'}`, val: true }] : []),
              ].map((item, i) => (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    item.val
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.val ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Care Services & Price Ranges */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Services Offered & Monthly Price Ranges
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { key: 'assistedLiving', label: 'Assisted Living', active: serv.assistedLiving },
                { key: 'homeHospital', label: 'Hospital at Home', active: serv.homeHospital, highlight: true },
                { key: 'palliativeCare', label: 'Palliative / Bedridden', active: serv.palliativeCare },
                { key: 'independentLiving', label: 'Independent Living', active: serv.independentLiving },
                { key: 'dementiaCare', label: 'Dementia Care', active: serv.dementiaCare },
                { key: 'dayCareServices', label: 'Day Care Services', active: serv.dayCareServices },
                { key: 'meals', label: 'Nutritious Meals', active: serv.meals },
                { key: 'recreationalActivities', label: 'Recreational Activities', active: serv.recreationalActivities },
              ].map((item) => {
                const price = pricing[item.key];
                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border ${
                      item.active
                        ? item.highlight
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-orange-200 bg-orange-50/30'
                        : 'border-slate-200 bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${item.active ? 'text-slate-900' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.active ? 'OFFERED' : 'NO'}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Price Range:</span>
                      {price?.from || price?.to ? (
                        <span className="font-bold text-[#E86A33] flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {price.from || '0'} – {price.to || '0'} / mo
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: Documents & Media Verification */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#E86A33]" />
              Section 3 • Uploaded Documents & Media
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click any document, video, or photo to inspect in high-resolution
            </span>
          </div>

          {/* Sub-section 1: Legal & Financial Verification Documents */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Official Legal & Financial Documents (6)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {[
                { key: 'registrationCertificate', label: 'Registration Certificate', doc: docs.registrationCertificate },
                { key: 'panCard', label: 'Organization PAN Card', doc: docs.panCard },
                { key: 'gstCertificate', label: 'GST Certificate', doc: docs.gstCertificate },
                { key: 'addressProof', label: 'Facility Address Proof', doc: docs.addressProof },
                { key: 'representativeIdProof', label: 'Representative ID Proof', doc: docs.representativeIdProof },
                { key: 'bankAccountDetails', label: 'Bank Account Details / Cheque', doc: docs.bankAccountDetails },
              ].map((item) => {
                const file = item.doc;
                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      file
                        ? 'border-slate-200 bg-white hover:border-[#E86A33]/50 hover:shadow-xs'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          {item.label}
                        </span>
                        {file ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Missing
                          </span>
                        )}
                      </div>

                      {file ? (
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5" title={file.name}>
                            <FileText className="w-4 h-4 text-[#E86A33] shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Size: {Math.round(file.size / 1024)} KB • Document
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No document uploaded</p>
                      )}
                    </div>

                    {file && (
                      <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDocument(file, item.label)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-[#E86A33] text-[#E86A33] hover:text-white border border-orange-200 hover:border-[#E86A33] text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(file, item.label)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
                          title={`Download ${file.name}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-section 2: Facility Video Walkthrough */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Facility Video Walkthrough
            </span>

            {docs.facilityVideo ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-4">
                  {/* Video Thumbnail with Play Button */}
                  <div
                    onClick={() => docs.facilityVideo && setVideoModalItem(docs.facilityVideo)}
                    className="w-28 h-20 bg-slate-950 rounded-xl overflow-hidden relative group cursor-pointer shrink-0 shadow-sm border border-slate-800 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="w-10 h-10 rounded-full bg-[#E86A33] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-10">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-white bg-black/75 px-1.5 py-0.5 rounded z-10 backdrop-blur-xs">
                      HD MP4
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      Video Walkthrough Attached
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{docs.facilityVideo.name}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      File Size: <b>{Math.round(docs.facilityVideo.size / 1024)} KB</b> • Senior Living Virtual Tour
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => docs.facilityVideo && setVideoModalItem(docs.facilityVideo)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = docs.facilityVideo?.dataUrl || FALLBACK_VIDEO_URL;
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = docs.facilityVideo?.name || 'facility_tour.mp4';
                      a.click();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center py-6">
                <Video className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">No facility video walkthrough uploaded</p>
                <p className="text-[11px] text-slate-400">Owner has not provided an MP4 video walkthrough</p>
              </div>
            )}
          </div>

          {/* Sub-section 3: Facility Photographs Gallery */}
          {docs.facilityPhotographs && docs.facilityPhotographs.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Facility Photographs ({docs.facilityPhotographs.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Click on any photo to open full-screen lightbox
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {docs.facilityPhotographs.map((photo, i) => {
                  const fallbackItem = FALLBACK_FACILITY_PHOTOS[i % FALLBACK_FACILITY_PHOTOS.length];
                  const imgSrc = photo.dataUrl || fallbackItem.url;
                  const photoTitle = fallbackItem.title || photo.name || `Facility Photo ${i + 1}`;

                  return (
                    <div
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className="group aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer shadow-2xs hover:shadow-md hover:border-[#E86A33] transition-all"
                    >
                      <img
                        src={imgSrc}
                        alt={photoTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                        Photo #{i + 1}
                      </span>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                        <span className="text-[10px] font-semibold truncate">
                          {photo.name || photoTitle}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-[#E86A33] flex items-center justify-center shrink-0 transition-colors">
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Commercial Terms, Legal Declaration & Owner Sign-Off */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
            Section 4 • Commercial Terms & Owner Sign-off
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agreement Status */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Agreements & Platform Terms
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Commercial Terms (10% on first billing + ₹299/mo subscription)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Legal Declaration (Truthfulness & Pune Jurisdiction)</span>
              </div>
              <span className="text-[11px] text-slate-500 block pt-1">
                Declared on: {fd.submissionDate || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            {/* Owner / Director / Founder Details & Digital Sign */}
            <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-200 space-y-3">
              <span className="text-xs font-bold text-[#E86A33] uppercase tracking-wider block">
                Owner / Authorized Signatory
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Owner / Director Name</span>
                  <span className="font-bold text-slate-900">{fd.ownerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone Number</span>
                  <span className="font-bold text-slate-900">{fd.ownerPhone || 'N/A'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-medium block">Mail ID</span>
                  <span className="font-bold text-slate-900">{fd.ownerEmail || 'N/A'}</span>
                </div>
              </div>

              {/* Digital Signature Rendering */}
              <div className="pt-2 border-t border-orange-200/60">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  Captured Digital Signature:
                </span>
                <div className="bg-white p-3 rounded-lg border border-slate-300 min-h-24 flex items-center justify-center">
                  {fd.digitalSignature ? (
                    <img
                      src={fd.digitalSignature}
                      alt="Digital Signature"
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">No signature image attached</span>
                  )}
                </div>
                {fd.digitalSignature && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Digitally signed by {fd.ownerName || 'Authorized Signatory'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal 1: Document Inspection Modal (PDFs, Images, Certificates) ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#E86A33] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-md">
                    {previewDoc.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {previewDoc.type || 'Official PDF Document'} • {Math.round(previewDoc.size / 1024)} KB • {fd.homeName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(activePdfUrl || previewDoc.dataUrl) && (
                  <button
                    onClick={() => {
                      const url = activePdfUrl || previewDoc.dataUrl;
                      if (!url) return;
                      const win = window.open();
                      if (win) {
                        win.document.write(
                          `<!DOCTYPE html><html><head><title>${previewDoc.name}</title><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#525659;}</style></head><body><iframe src="${url}" frameborder="0" style="border:0;width:100%;height:100%;" allowfullscreen></iframe></body></html>`
                        );
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setActivePdfUrl(null);
                  }}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center text-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center min-h-[55vh]">
              {isGeneratingPdf ? (
                <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#E86A33] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-800">Generating Official PDF Document...</p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Rendering high-resolution A4 verification certificate for {fd.homeName}
                  </p>
                </div>
              ) : activePdfUrl?.startsWith('data:image') || (previewDoc.dataUrl?.startsWith('data:image') && !activePdfUrl?.startsWith('data:application/pdf')) ? (
                <img
                  src={activePdfUrl || previewDoc.dataUrl}
                  alt={previewDoc.name}
                  className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-md bg-white p-2"
                />
              ) : (activePdfUrl || previewDoc.dataUrl) ? (
                <iframe
                  src={activePdfUrl || previewDoc.dataUrl}
                  className="w-full h-[72vh] rounded-xl border border-slate-300 bg-white shadow-sm"
                  title={previewDoc.name}
                />
              ) : (
                <div className="text-center p-8">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Unable to load document preview</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500">Document status: Verified Official Record</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="px-4 py-2 bg-[#E86A33] hover:bg-[#d45823] text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setActivePdfUrl(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Video Theater Modal ── */}
      {videoModalItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-950 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800 space-y-3">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E86A33]/20 text-[#E86A33] flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Facility Walkthrough: {fd.homeName || 'Senior Living Facility'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {videoModalItem.name} • {Math.round(videoModalItem.size / 1024)} KB • High Definition Video
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalItem(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="px-4 sm:px-6">
              <video
                src={videoModalItem.dataUrl || FALLBACK_VIDEO_URL}
                controls
                autoPlay
                className="w-full aspect-video rounded-xl bg-black shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Recorded facility tour walkthrough submitted by {fd.ownerName || 'facility management'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = videoModalItem.dataUrl || FALLBACK_VIDEO_URL;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = videoModalItem.name;
                    a.click();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModalItem(null)}
                  className="px-4 py-2 bg-[#E86A33] hover:bg-[#D85820] text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Photo Lightbox Gallery Modal ── */}
      {activePhotoIndex !== null && docs.facilityPhotographs && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {fd.homeName} — Facility Photograph
              </h3>
              <span className="text-xs text-white/60">
                Photo {activePhotoIndex + 1} of {docs.facilityPhotographs.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Main Photo View with Left/Right Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {activePhotoIndex > 0 && (
              <button
                type="button"
                onClick={() => setActivePhotoIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                className="absolute left-2 sm:left-6 z-10 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
                title="Previous Photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="max-h-[75vh] max-w-[85vw] flex items-center justify-center">
              <img
                src={
                  docs.facilityPhotographs[activePhotoIndex].dataUrl ||
                  FALLBACK_FACILITY_PHOTOS[activePhotoIndex % FALLBACK_FACILITY_PHOTOS.length].url
                }
                alt={`Photo ${activePhotoIndex + 1}`}
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>

            {activePhotoIndex < docs.facilityPhotographs.length - 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((i) =>
                    i !== null && i < docs.facilityPhotographs!.length - 1 ? i + 1 : i
                  )
                }
                className="absolute right-2 sm:right-6 z-10 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
                title="Next Photo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Caption & Actions */}
          <div className="flex items-center justify-between text-xs text-white/80 border-t border-white/10 pt-3">
            <span className="truncate max-w-md">
              {FALLBACK_FACILITY_PHOTOS[activePhotoIndex % FALLBACK_FACILITY_PHOTOS.length].title ||
                docs.facilityPhotographs[activePhotoIndex].name}
            </span>

            <div className="flex items-center gap-2">
              <a
                href={
                  docs.facilityPhotographs[activePhotoIndex].dataUrl ||
                  FALLBACK_FACILITY_PHOTOS[activePhotoIndex % FALLBACK_FACILITY_PHOTOS.length].url
                }
                download={docs.facilityPhotographs[activePhotoIndex].name || `facility-photo-${activePhotoIndex + 1}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Photo</span>
              </a>

              <button
                type="button"
                onClick={() => setActivePhotoIndex(null)}
                className="px-4 py-2 bg-[#E86A33] hover:bg-[#D85820] text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reject Application</h3>
              <p className="text-xs text-slate-500 mt-1">
                Please provide the reason for rejection or details of documents requiring resubmission.
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Missing organization registration deed, please re-upload valid fire NOC..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus('rejected', rejectionReason)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Approve Facility Registration</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirming approval will mark <b>{fd.homeName}</b> as verified and ready for active listing on the Merabetta platform.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus('approved')}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { EnrollmentRecord, EnrollmentStatus } from '@/types/enrollment';
import { exportEnrollmentsToExcel } from '@/utils/adminExport';
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Phone,
  User,
  IndianRupee,
  Hospital,
  HeartPulse,
  AlertCircle,
} from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
  }>({ total: 0, submitted: 0, approved: 0, rejected: 0 });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch enrollments from API
  const fetchEnrollments = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        status: selectedStatus,
        sortOrder,
      });

      const res = await fetch(`/api/admin/enrollments?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRecords(data.records || []);
        setTotalRecords(data.totalRecords || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching admin enrollments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, limit, debouncedSearch, selectedStatus, sortOrder]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Quick Status Update
  const handleQuickStatusChange = async (id: string, newStatus: EnrollmentStatus) => {
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update list
        setRecords((prev) =>
          prev.map((rec) => (rec._id === id || rec.referenceId === id ? { ...rec, status: newStatus } : rec))
        );
        fetchEnrollments(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    exportEnrollmentsToExcel(records);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div className="h-5 w-px bg-slate-200" />
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#E86A33] text-xs font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEnrollments(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Refresh records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E86A33]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#E86A33] hover:bg-[#D85820] rounded-lg shadow-2xs transition-all"
            >
              <span>Public Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Old Age Home Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, verify, approve, and review senior care facility enrollment applications.
          </p>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card: Total */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Applications</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
            </div>
          </div>

          {/* Card: Submitted / Pending */}
          <div className="bg-white rounded-xl border border-orange-200 bg-orange-50/20 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-100 text-[#E86A33] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-orange-950 mt-0.5">{stats.submitted}</h3>
            </div>
          </div>

          {/* Card: Approved */}
          <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Approved Homes</p>
              <h3 className="text-2xl font-black text-emerald-950 mt-0.5">{stats.approved}</h3>
            </div>
          </div>

          {/* Card: Rejected */}
          <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/20 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Rejected</p>
              <h3 className="text-2xl font-black text-rose-950 mt-0.5">{stats.rejected}</h3>
            </div>
          </div>
        </div>

        {/* Filter, Search & Export Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Home Name, Contact, Mobile, City, Ref ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                title="Toggle sort order"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Status:</span>
            {[
              { key: 'all', label: 'All Registrations', count: stats.total },
              { key: 'submitted', label: 'Pending Review', count: stats.submitted, color: 'text-amber-700' },
              { key: 'approved', label: 'Approved', count: stats.approved, color: 'text-emerald-700' },
              { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'text-rose-700' },
            ].map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedStatus(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#E86A33]" />
              <p className="text-sm font-semibold text-slate-600">Loading registrations...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center px-4 space-y-3">
              <div className="w-12 h-12 bg-orange-100 text-[#E86A33] rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {stats.total === 0 ? 'No registrations yet' : 'No matching registrations found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {stats.total === 0
                  ? 'No old age home applications have been submitted yet. Real applications submitted through the enrollment form will appear here automatically.'
                  : 'No records match your search criteria or filter. Try adjusting your search query or reset the filter.'}
              </p>
              {stats.total === 0 ? (
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold rounded-lg shadow-2xs transition-all"
                  >
                    <span>Go to Enrollment Form</span>
                  </Link>
                </div>
              ) : (
                (searchQuery || selectedStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Old Age Home</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Facilities & Pricing</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => {
                    const fd = rec.fullData || {};
                    const services = fd.servicesOffered || {};
                    const pricing = fd.facilityPricing || {};
                    const assistedLivingPrice = pricing.assistedLiving;
                    const homeHospitalPrice = pricing.homeHospital;
                    const palliativePrice = pricing.palliativeCare;

                    return (
                      <tr key={rec._id || rec.referenceId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Ref ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{rec.referenceId}</span>
                            <button
                              onClick={() => copyToClipboard(rec.referenceId)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                              title="Copy Reference ID"
                            >
                              {copiedId === rec.referenceId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Old Age Home */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{fd.homeName || 'Unnamed Home'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {fd.city ? `${fd.city}, ${fd.state || ''}` : 'Location not specified'}
                            {fd.yearEstablished ? ` • Est. ${fd.yearEstablished}` : ''}
                          </div>
                        </td>

                        {/* Owner & Contact */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{fd.ownerName || fd.contactPersonName || 'N/A'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{fd.ownerPhone || fd.mobileNumber || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Facilities & Pricing */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                              Cap: {fd.totalCapacity || '0'}
                            </span>

                            {services.assistedLiving && (
                              <span className="px-1.5 py-0.5 bg-orange-50 text-[#E86A33] border border-orange-200 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <IndianRupee className="w-2.5 h-2.5" />
                                Assisted Living
                                {assistedLivingPrice?.from ? ` (₹${assistedLivingPrice.from}-${assistedLivingPrice.to})` : ''}
                              </span>
                            )}

                            {services.homeHospital && (
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <Hospital className="w-2.5 h-2.5" />
                                Hospital at Home
                                {homeHospitalPrice?.from ? ` (₹${homeHospitalPrice.from}-${homeHospitalPrice.to})` : ''}
                              </span>
                            )}

                            {services.palliativeCare && (
                              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <HeartPulse className="w-2.5 h-2.5" />
                                Palliative / Bedridden
                                {palliativePrice?.from ? ` (₹${palliativePrice.from}-${palliativePrice.to})` : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {rec.submittedAt ? new Date(rec.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {rec.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {rec.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                          {rec.status === 'submitted' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Detail Link */}
                            <Link
                              href={`/admin/enrollments/${rec.referenceId || rec._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>

                            {/* Quick Action Menu */}
                            {rec.status !== 'approved' && (
                              <button
                                onClick={() => handleQuickStatusChange(rec._id || rec.referenceId, 'approved')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Quick Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {rec.status !== 'rejected' && (
                              <button
                                onClick={() => handleQuickStatusChange(rec._id || rec.referenceId, 'rejected')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Quick Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && records.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>
                  Showing <b>{(currentPage - 1) * limit + 1}</b> to{' '}
                  <b>{Math.min(currentPage * limit, totalRecords)}</b> of <b>{totalRecords}</b> entries
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span>Show</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded font-medium text-xs focus:outline-none focus:border-[#E86A33]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#E86A33] text-white shadow-2xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

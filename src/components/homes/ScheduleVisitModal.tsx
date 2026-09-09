'use client';

import React, { useState } from 'react';
import { PublicFacility } from '@/utils/publicHomes';
import {
  X,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ScheduleVisitModalProps {
  facility: PublicFacility | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleVisitModal({
  facility,
  isOpen,
  onClose,
}: ScheduleVisitModalProps) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(t.directory.modal.slotMorning);
  const [residentCondition, setResidentCondition] = useState('Assisted Living');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  if (!isOpen || !facility) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please provide your name and a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/homes/${facility.referenceId || facility.id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visit',
          fullName,
          phoneNumber,
          preferredDate,
          timeSlot,
          residentCondition,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessCode(data.referenceCode || `BK-VISIT-${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        setErrorMsg(data.error || 'Failed to submit visit request. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again or chat with us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessCode(null);
    setErrorMsg(null);
    setFullName('');
    setPhoneNumber('');
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello MeraBetta Team, I have booked a physical tour for ${facility.name} (Booking ID: ${successCode}). Please confirm the appointment with the facility director.`
  );

  const careOptions = [
    { id: 'Independent', label: t.directory.modal.careIndependent },
    { id: 'Assisted Living', label: t.directory.modal.careAssisted },
    { id: 'Bedridden', label: t.directory.modal.careBedridden },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-50 via-white to-purple-50/40 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E86A33]/10 text-[#E86A33] text-[10px] font-extrabold uppercase tracking-wider">
              {t.directory.card.bookVisit}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">{t.directory.modal.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-700">{facility.name}</span> • {facility.city}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {successCode ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">{t.directory.modal.confirmedTitle}</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {t.directory.modal.confirmedDesc(facility.name, preferredDate, timeSlot)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block font-mono text-xs">
                <span className="text-slate-400">{t.directory.modal.passCode} </span>
                <b className="text-[#E86A33] text-sm">{successCode}</b>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={`https://wa.me/919371458326?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                  <span>{t.directory.modal.sendWhatsApp}</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {t.directory.modal.done}
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.directory.modal.fullName}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={t.directory.modal.fullNamePlaceholder}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.directory.modal.phone}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder={t.directory.modal.phonePlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.directory.modal.visitDate}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.directory.modal.timeSlot}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                  >
                    <option value={t.directory.modal.slotMorning}>{t.directory.modal.slotMorning}</option>
                    <option value={t.directory.modal.slotAfternoon}>{t.directory.modal.slotAfternoon}</option>
                    <option value={t.directory.modal.slotEvening}>{t.directory.modal.slotEvening}</option>
                  </select>
                </div>
              </div>

              {/* Resident Care Requirement */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {t.directory.modal.careLevel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {careOptions.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setResidentCondition(tier.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        residentCondition === tier.id
                          ? 'border-[#E86A33] bg-orange-50 text-[#E86A33]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {t.directory.modal.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.directory.modal.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-extrabold tracking-wide uppercase shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t.directory.modal.booking : t.directory.modal.confirmBtn}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  No advance booking fee • Instant WhatsApp confirmation
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


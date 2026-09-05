'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { EnrollmentFormData } from '../types/enrollment';
import {
  Percent,
  Sparkles,
  CheckCircle2,
  Scale,
  AlertCircle,
  UserCheck,
  PenTool,
  Type,
  RotateCcw,
  Copy,
  Calendar,
  Check,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface Section4Props {
  formData: EnrollmentFormData;
  onChange: (field: keyof EnrollmentFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function Section4CommercialTerms({ formData, onChange, errors = {} }: Section4Props) {
  const { t } = useLanguage();
  const s = t.s4;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState<string>(formData.ownerName || '');
  const [hasDrawn, setHasDrawn] = useState<boolean>(Boolean(formData.digitalSignature));

  // Initialize and redraw existing signature if available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a'; // slate-900
    }

    if (formData.digitalSignature && formData.digitalSignature.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = formData.digitalSignature;
    }
  }, [signMode, formData.digitalSignature]);

  // Touch & Mouse Drawing Handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (signMode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signMode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange('digitalSignature', dataUrl);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    setTypedName('');
    onChange('digitalSignature', '');
  };

  const handleTypedSign = useCallback((text: string) => {
    setTypedName(text);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!text.trim()) {
      setHasDrawn(false);
      onChange('digitalSignature', '');
      return;
    }

    ctx.save();
    ctx.font = 'italic bold 32px "Caveat", "Dancing Script", "Brush Script MT", "Segoe Script", cursive, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.width / 2, rect.height / 2);
    ctx.restore();

    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    onChange('digitalSignature', dataUrl);
  }, [onChange]);

  const handleCopyContactDetails = () => {
    if (formData.contactPersonName) onChange('ownerName', formData.contactPersonName);
    if (formData.mobileNumber) onChange('ownerPhone', formData.mobileNumber);
    if (formData.emailAddress) onChange('ownerEmail', formData.emailAddress);
  };

  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 border-l-4 border-l-[#E86A33]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E86A33]">{s.sectionLabel}</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{s.title}</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{s.subtitle}</p>
      </div>

      {/* Card 1: Commercial Terms */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
          {s.cardCommercial}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Term 1 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E86A33] text-white flex items-center justify-center shadow-xs">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#E86A33] uppercase tracking-wide">{s.term1Label}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{s.term1Title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.term1Body}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{s.term1Footer}</span>
            </div>
          </div>

          {/* Term 2 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">{s.term2Label}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{s.term2Title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.term2Body}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{s.term2Footer}</span>
            </div>
          </div>
        </div>

        {/* Commercial Agreement Checkbox */}
        <div
          className={`mt-3 p-4 rounded-lg border transition-all ${
            formData.commercialAgreed
              ? 'bg-orange-50/50 border-[#E86A33] ring-1 ring-[#E86A33]'
              : errors.commercialAgreed
              ? 'bg-rose-50/50 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.commercialAgreed}
              onChange={(e) => onChange('commercialAgreed', e.target.checked)}
              className="w-5 h-5 rounded text-[#E86A33] accent-[#E86A33] mt-0.5 shrink-0 cursor-pointer"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">
                {s.commercialCheckLabel} <span className="text-rose-500">*</span>
              </p>
              <p className="text-slate-500 mt-0.5">{s.commercialCheckSub}</p>
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
          <span>{s.cardDeclaration}</span>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100">
          <p>{s.declaration1}</p>
          <p>{s.declaration2}</p>
          <p className="text-slate-700 font-semibold flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#E86A33] shrink-0" />
            {s.declaration3}
          </p>
        </div>

        {/* Declaration Checkbox */}
        <div
          className={`p-4 rounded-lg border transition-all ${
            formData.declarationAgreed
              ? 'bg-orange-50/50 border-[#E86A33] ring-1 ring-[#E86A33]'
              : errors.declarationAgreed
              ? 'bg-rose-50/50 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.declarationAgreed}
              onChange={(e) => onChange('declarationAgreed', e.target.checked)}
              className="w-5 h-5 rounded text-[#E86A33] accent-[#E86A33] mt-0.5 shrink-0 cursor-pointer"
            />
            <span className="text-xs text-slate-800 font-medium">
              {s.declarationCheckLabel} <span className="text-rose-500 font-bold">*</span>
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

      {/* Card 3: Old Age Home Owner / Signatory Details (Last Section for Old Age Home Owner) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#E86A33]" />
              {s.cardOwner}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{s.cardOwnerSub}</p>
          </div>

          {/* Quick Copy Action */}
          {formData.contactPersonName && (
            <button
              type="button"
              onClick={handleCopyContactDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#E86A33] text-xs font-semibold rounded-lg border border-orange-200 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{s.copyContactDetails}</span>
            </button>
          )}
        </div>

        {/* Owner Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Owner / Director / Founder Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.ownerName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={s.ownerNamePlaceholder}
              value={formData.ownerName}
              onChange={(e) => onChange('ownerName', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.ownerName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.ownerName && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.ownerName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.ownerPhone} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder={s.ownerPhonePlaceholder}
                value={formData.ownerPhone}
                onChange={(e) => onChange('ownerPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                  errors.ownerPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.ownerPhone && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.ownerPhone}</p>
            )}
          </div>

          {/* Mail ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {s.ownerEmail} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder={s.ownerEmailPlaceholder}
              value={formData.ownerEmail}
              onChange={(e) => onChange('ownerEmail', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] ${
                errors.ownerEmail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.ownerEmail && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.ownerEmail}</p>
            )}
          </div>
        </div>

        {/* Digital Signature Box */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-800">
                {s.digitalSign} <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">{s.digitalSignSub}</p>
            </div>

            {/* Mode Switch & Clear Action */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    signMode === 'draw'
                      ? 'bg-white text-[#E86A33] shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>{s.drawMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('type')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    signMode === 'type'
                      ? 'bg-white text-[#E86A33] shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  <span>{s.typeMode}</span>
                </button>
              </div>

              {(hasDrawn || formData.digitalSignature) && (
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{s.clearSign}</span>
                </button>
              )}
            </div>
          </div>

          {/* Type Mode input */}
          {signMode === 'type' && (
            <div className="mb-2">
              <input
                type="text"
                placeholder={s.typePlaceholder}
                value={typedName}
                onChange={(e) => handleTypedSign(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
              />
            </div>
          )}

          {/* Canvas Pad */}
          <div
            className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${
              formData.digitalSignature
                ? 'border-emerald-400 bg-emerald-50/10'
                : errors.digitalSignature
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-slate-300 bg-slate-50/40 hover:border-slate-400'
            }`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`w-full h-36 sm:h-40 block touch-none ${
                signMode === 'draw' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />

            {/* Hint overlay if empty and in draw mode */}
            {!hasDrawn && !formData.digitalSignature && signMode === 'draw' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                <PenTool className="w-6 h-6 stroke-1 mb-1 text-slate-300" />
                <span className="text-xs font-medium">{s.digitalSignSub}</span>
              </div>
            )}

            {/* Signature line indicator */}
            <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200 pointer-events-none" />
          </div>

          {errors.digitalSignature && (
            <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.digitalSignature}
            </p>
          )}

          {/* Signature Verification & Date Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500">
            {formData.digitalSignature ? (
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>
                  {s.signatureCaptured}
                  {formData.ownerName ? ` • ${formData.ownerName}` : ''}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No signature captured yet</span>
            )}

            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {s.dateSigned}: {formData.submissionDate || new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

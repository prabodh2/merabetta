'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import Section1OrgInfo from '../components/Section1OrgInfo';
import Section2FacilityDetails from '../components/Section2FacilityDetails';
import Section3Documents from '../components/Section3Documents';
import Section4CommercialTerms from '../components/Section4CommercialTerms';

import dynamic from 'next/dynamic';

const SuccessModal = dynamic(() => import('../components/SuccessModal'), { ssr: false });

import { EnrollmentFormData, INITIAL_FORM_DATA } from '../types/enrollment';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { flattenFormData } from '../utils/exportHelpers';

const LOCAL_STORAGE_KEY = 'merabetta_enrollment_draft_v1';

export default function EnrollmentPage() {
  const [formData, setFormData] = useState<EnrollmentFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string>('');
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);

  // Generate Reference ID on load
  useEffect(() => {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    setReferenceId(`MB-OAH-${randomCode}`);

    // Load draft from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save draft automatically on change
  const saveDraft = useCallback((data: EnrollmentFormData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(now);
    } catch {
      // Ignore quota error for very large images
    }
  }, []);

  const handleFieldChange = (field: keyof EnrollmentFormData, value: unknown) => {
    const updated = {
      ...formData,
      [field]: value,
    };
    setFormData(updated);
    saveDraft(updated);

    // Clear error for that field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step Validations
  const validateCurrentStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.homeName.trim()) stepErrors.homeName = 'Please enter the name of the Old Age Home.';
      if (!formData.registrationNumber.trim()) stepErrors.registrationNumber = 'Registration number is required.';
      if (!formData.yearEstablished.trim()) stepErrors.yearEstablished = 'Year established is required.';
      if (!formData.address.trim()) stepErrors.address = 'Full address is required.';
      if (!formData.city.trim()) stepErrors.city = 'City is required.';
      if (!formData.state.trim()) stepErrors.state = 'State is required.';
      if (!formData.pinCode.trim() || formData.pinCode.length !== 6) {
        stepErrors.pinCode = 'Valid 6-digit PIN code is required.';
      }
      if (!formData.contactPersonName.trim()) stepErrors.contactPersonName = 'Contact person name is required.';
      if (!formData.designation.trim()) stepErrors.designation = 'Designation is required.';
      if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
        stepErrors.mobileNumber = 'Valid 10-digit mobile number is required.';
      }
      if (!formData.emailAddress.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        stepErrors.emailAddress = 'Valid email address is required.';
      }
    }

    if (step === 2) {
      if (!formData.totalCapacity.trim() || parseInt(formData.totalCapacity, 10) <= 0) {
        stepErrors.totalCapacity = 'Please enter valid total capacity.';
      }
      if (!formData.currentResidents.trim() || parseInt(formData.currentResidents, 10) < 0) {
        stepErrors.currentResidents = 'Please enter valid current resident count.';
      }
    }

    if (step === 4) {
      if (!formData.commercialAgreed) {
        stepErrors.commercialAgreed = 'You must accept the commercial terms to continue.';
      }
      if (!formData.declarationAgreed) {
        stepErrors.declarationAgreed = 'You must confirm and agree to the declaration.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset and clear all entered form data?')) {
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setCompletedSteps([]);
      setCurrentStep(1);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignore
      }
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setReferenceId(`MB-OAH-${randomCode}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate final step
    if (!validateCurrentStep(4)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const flatData = flattenFormData(formData, referenceId);

      // Save submission into MongoDB Atlas
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, flatData, fullData: formData }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save to database');
      }

      // Also trigger optional external endpoint if defined
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referenceId, flatData, fullData: formData }),
        }).catch((err) => console.error('External submission POST error:', err));
      }

      // Clear local draft on successful MongoDB submission
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignore
      }

      setIsSuccessOpen(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(`Submission Error: ${err.message || 'Failed to connect to server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] py-6 px-3 sm:px-6 max-w-3xl mx-auto">
      <div className="w-full space-y-4">
        {/* Top Header Card */}
        <Header onReset={handleReset} lastSavedTime={lastSavedTime} />

        {/* Step Navigation Bar */}
        <ProgressBar
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <Section1OrgInfo
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Section2FacilityDetails
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Section3Documents
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <Section4CommercialTerms
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}



          {/* Bottom Navigation & Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 sticky bottom-4 z-20">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Page {currentStep} of 4
              </span>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#E86A33] hover:bg-[#D85820] text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-6 space-y-1">
          <p>© {new Date().getFullYear()} Vision55 Megacare Private Limited. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            merabetta.com • Senior Living & Healthcare Platform
          </p>
        </footer>
      </div>

      {/* Success Celebration Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        onReset={handleReset}
        formData={formData}
      />
    </main>
  );
}

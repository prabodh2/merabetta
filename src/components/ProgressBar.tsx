'use client';

import React from 'react';
import { Building, Stethoscope, FileUp, Handshake, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const STEP_ICONS = [Building, Stethoscope, FileUp, Handshake];

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  completedSteps: number[];
}

export default function ProgressBar({ currentStep, onStepClick, completedSteps }: ProgressBarProps) {
  const { t } = useLanguage();
  const steps = t.progress.steps;
  const percentage = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
      {/* Mobile view progress text */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
        <span className="text-[#E86A33] font-bold">
          {t.progress.stepOf(currentStep, steps.length)} {steps[currentStep - 1].title}
        </span>
        <span className="text-slate-500 font-medium">{percentage}{t.progress.completed}</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#E86A33] transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Stepper Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {steps.map((step, idx) => {
          const stepId = idx + 1;
          const Icon = STEP_ICONS[idx];
          const isActive = currentStep === stepId;
          const isCompleted = completedSteps.includes(stepId);

          return (
            <button
              key={stepId}
              type="button"
              onClick={() => onStepClick(stepId)}
              className={`flex flex-col items-center text-center p-1.5 rounded-lg transition-all cursor-pointer group ${
                isActive
                  ? 'bg-orange-50 text-[#E86A33] font-semibold'
                  : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                  isActive
                    ? 'bg-[#E86A33] text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs truncate max-w-full ${
                  isActive ? 'text-[#E86A33] font-bold' : isCompleted ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {step.shortTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

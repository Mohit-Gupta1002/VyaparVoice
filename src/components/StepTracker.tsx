"use client";

import React from "react";
import { Mic, HelpCircle, FileCheck, Check } from "lucide-react";

export type WorkflowStep = 1 | 2 | 3;

interface StepTrackerProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
  canNavigateToStep?: (step: WorkflowStep) => boolean;
}

export function StepTracker({ currentStep, onStepClick, canNavigateToStep }: StepTrackerProps) {
  const steps = [
    {
      step: 1 as WorkflowStep,
      title: "1. Business Idea",
      subtitle: "Voice or Text in Any Language",
      icon: Mic,
    },
    {
      step: 2 as WorkflowStep,
      title: "2. Clarifications",
      subtitle: "Operational Assumptions & Scope",
      icon: HelpCircle,
    },
    {
      step: 3 as WorkflowStep,
      title: "3. Enterprise BRD",
      subtitle: "12-Section Actionable Plan",
      icon: FileCheck,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-2 sm:px-4 no-print" role="navigation" aria-label="Workflow Steps">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
        {/* Hairline ledger progress line */}
        <div className="absolute top-5 left-[16.666%] right-[16.666%] h-0.5 bg-warm-300 dark:bg-charcoal-700 z-0 hidden sm:block">
          <div
            className="h-full bg-forest-700 dark:bg-forest-500 transition-all duration-500 ease-out"
            style={{
              width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
            }}
          />
        </div>

        {steps.map((item) => {
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isClickable = canNavigateToStep ? canNavigateToStep(item.step) : false;
          const Icon = item.icon;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isClickable && !isCurrent}
              onClick={() => isClickable && onStepClick?.(item.step)}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? "bg-white dark:bg-charcoal-800 border-forest-700 dark:border-forest-500 shadow-xs ring-1 ring-forest-700/20 dark:ring-forest-500/30"
                  : isDone
                  ? "bg-warm-100/70 dark:bg-charcoal-850/70 border-warm-300 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-800 text-ink-800 dark:text-ink-200"
                  : "bg-transparent border-dashed border-warm-300 dark:border-charcoal-700 opacity-60 cursor-not-allowed text-ink-400 dark:text-ink-500"
              }`}
            >
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md text-xs sm:text-sm font-bold transition-colors ${
                  isDone
                    ? "bg-forest-700 dark:bg-forest-600 text-warm-50"
                    : isCurrent
                    ? "bg-forest-800 dark:bg-forest-600 text-warm-50 shadow-xs"
                    : "bg-warm-200 dark:bg-charcoal-700 text-ink-600 dark:text-ink-400"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>

              <div className="text-center sm:text-left min-w-0">
                <p
                  className={`text-xs font-bold sm:text-sm truncate ${
                    isCurrent
                      ? "text-forest-900 dark:text-forest-300"
                      : "text-ink-900 dark:text-ink-100"
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-[11px] text-ink-600 dark:text-ink-400 hidden sm:block truncate">{item.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

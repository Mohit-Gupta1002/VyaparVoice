"use client";

import React, { useState } from "react";
import { ClarificationQuestion } from "@/lib/types";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface ClarificationModalProps {
  questions: ClarificationQuestion[];
  isDemo: boolean;
  onProceed: (answers: Record<string, string>, useAllAssumptions: boolean) => void;
  onBack: () => void;
  isGeneratingBrd: boolean;
}

export function ClarificationModal({
  questions,
  isDemo,
  onProceed,
  onBack,
  isGeneratingBrd,
}: ClarificationModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleUseExplicitAssumptions = () => {
    const assumedAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      assumedAnswers[q.id] = q.defaultAssumption;
    });
    onProceed(assumedAnswers, true);
  };

  const handleProceedWithCustomAnswers = () => {
    const resolvedAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      const custom = answers[q.id]?.trim();
      resolvedAnswers[q.id] = custom ? custom : q.defaultAssumption;
    });
    onProceed(resolvedAnswers, false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="document-stamp document-stamp-verified">
                BHASHABRD CLARIFICATIONS
              </span>
              {isDemo && (
                <span className="document-stamp document-stamp-demo">
                  SIMULATION
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
              Clarifications & Explicit Assumptions
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 leading-relaxed max-w-2xl">
              We identified {questions.length} operational decisions needed for a production-grade BRD.
              You can provide your specific operational rules below, or proceed in one click with our standard assumptions.
            </p>
          </div>

          <button
            onClick={handleUseExplicitAssumptions}
            disabled={isGeneratingBrd}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-forest-700 px-5 py-2.5 text-xs font-bold text-warm-50 shadow-xs hover:bg-forest-800 disabled:opacity-60 transition shrink-0"
          >
            {isGeneratingBrd ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating Plan...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-warm-200" /> Proceed with Explicit Assumptions
              </>
            )}
          </button>
        </div>

        {/* Quality guarantee stamp callout */}
        <div className="flex items-start gap-2.5 rounded-md bg-warm-100/80 dark:bg-charcoal-850/80 p-3.5 border border-warm-300 dark:border-charcoal-700 text-xs text-ink-800 dark:text-ink-300">
          <ShieldCheck className="h-4 w-4 text-forest-700 dark:text-forest-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-ink-900 dark:text-ink-100 font-bold">Explicit Assumption Guarantee:</strong> Unanswered questions are converted into explicitly labeled assumptions in Section 9 of your BRD. We never present unverified assumptions as confirmed facts.
          </div>
        </div>

        {/* Staged BRD Generation Status */}
        {isGeneratingBrd && (
          <div className="rounded-md border border-forest-300 dark:border-forest-800/80 bg-forest-50/90 dark:bg-forest-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest-950 dark:text-forest-200 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-forest-700 dark:text-forest-400" />
                <span>BhashaBRD Engine Synthesizing 12-Section Specification</span>
              </span>
              <span className="text-[11px] font-mono text-forest-700 dark:text-forest-400">
                {isDemo ? "Deterministic Simulation" : "Sarvam Indic LLM Active"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-forest-900 dark:text-forest-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-forest-600 animate-ping" />
                <span>Executive summary & stakeholder personas</span>
              </div>
              <div className="flex items-center gap-2 text-forest-900 dark:text-forest-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
                <span>Functional requirements with unique IDs & priorities</span>
              </div>
              <div className="flex items-center gap-2 text-forest-900 dark:text-forest-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
                <span>Business rules & acceptance criteria</span>
              </div>
              <div className="flex items-center gap-2 text-forest-900 dark:text-forest-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
                <span>Explicit assumptions & implementation milestones</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List of clarification questions with restrained motion */}
      <div className="space-y-4">
        {questions.map((q, index) => {
          const currentAnswer = answers[q.id] || "";
          const isCustomized = currentAnswer.trim().length > 0;

          return (
            <div
              key={q.id}
              className="rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-5 sm:p-6 shadow-xs space-y-4 hover:border-warm-400 dark:hover:border-charcoal-600 transition"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-warm-100 dark:bg-charcoal-700 font-mono text-xs font-bold text-ink-800 dark:text-ink-200 border border-warm-300 dark:border-charcoal-600">
                  0{index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-ink-900 dark:text-ink-100 leading-snug">{q.question}</h3>
                  <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">{q.context}</p>
                </div>
              </div>

              {/* Default assumption badge and content */}
              <div className="rounded-md bg-warm-50 dark:bg-charcoal-850/90 p-3.5 border border-warm-200 dark:border-charcoal-700 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-terracotta-700 dark:text-terracotta-400">
                  <span className="document-stamp document-stamp-assumption">
                    RECOMMENDED ASSUMPTION
                  </span>
                </div>
                <p className="text-ink-800 dark:text-ink-200 leading-relaxed italic">{q.defaultAssumption}</p>
              </div>

              {/* User answer override */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-800 dark:text-ink-200 flex items-center justify-between">
                  <span>Custom Operational Answer (Optional):</span>
                  {isCustomized ? (
                    <span className="text-[11px] text-forest-700 dark:text-forest-400 font-bold">✓ Custom Answer Set</span>
                  ) : (
                    <span className="text-[11px] text-ink-400 dark:text-ink-500">Leave blank to adopt recommended assumption</span>
                  )}
                </label>
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={`E.g. ${q.defaultAssumption.slice(0, 75)}...`}
                  disabled={isGeneratingBrd}
                  className="w-full rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 px-3.5 py-2.5 text-xs sm:text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:border-forest-700 dark:focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-700/20 dark:focus:ring-forest-500/20 disabled:bg-warm-100 dark:disabled:bg-charcoal-900 transition"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={isGeneratingBrd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Edit Idea
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleProceedWithCustomAnswers}
            disabled={isGeneratingBrd}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-forest-700 text-xs font-bold text-warm-50 shadow-xs hover:bg-forest-800 disabled:opacity-60 transition w-full sm:w-auto"
          >
            {isGeneratingBrd ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating Structured BRD...
              </>
            ) : (
              <>
                Generate Structured BRD <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { StepTracker, WorkflowStep } from "@/components/StepTracker";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { ClarificationModal } from "@/components/ClarificationModal";
import { BrdViewer } from "@/components/BrdViewer";
import { SupportedLanguageCode, ClarificationQuestion, StructuredBRD } from "@/lib/types";
import { DEFAULT_SAMPLE_IDEA, BUSINESS_PROBLEMS, BusinessProblemExample } from "@/lib/constants";
import { generateDemoBRD } from "@/lib/demo-data";
import { BrandMarquee } from "@/components/BrandMarquee";
import {
  Mic,
  FileText,
  Upload,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
  Package,
  Truck,
  Receipt,
  Rocket,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

type InputMode = "text" | "record" | "upload";

const ANALYSIS_STAGES = [
  "Understanding business domain & core problem",
  "Identifying operational actors & key stakeholders",
  "Checking missing constraints & scope boundaries",
  "Organising requirements into structured assumptions",
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");
  const [ideaText, setIdeaText] = useState<string>("");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);

  // Staged Analysis progress state
  const [isAnalyzingClarifications, setIsAnalyzingClarifications] = useState<boolean>(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState<number>(0);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clarifications state
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);

  // BRD generation state
  const [generatedBrd, setGeneratedBrd] = useState<StructuredBRD | null>(null);
  const [isGeneratingBrd, setIsGeneratingBrd] = useState<boolean>(false);

  // General error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const inputSectionRef = useRef<HTMLDivElement | null>(null);

  // Check health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setIsDemo(Boolean(data.isDemo));
        }
      } catch (err) {
        console.error("Health check error:", err);
      }
    }
    checkHealth();
  }, []);

  // Cleanup staged timer
  useEffect(() => {
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, []);

  // Handle selecting a business problem example
  const handleSelectProblem = (problem: BusinessProblemExample) => {
    setActiveProblemId(problem.id);
    setIdeaText(problem.text);
    setSelectedLanguage(problem.language);
    setInputMode("text");
    setErrorMessage(null);

    // Smooth scroll to review/input area
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Immediate Sample BRD Explorer
  const handleExploreSampleBrd = () => {
    const sampleBrd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    setGeneratedBrd(sampleBrd);
    setCurrentStep(3);
  };

  // Step 1 -> Step 2: Analyze idea and request clarifications
  const handleProceedToClarifications = async () => {
    if (!ideaText || ideaText.trim().length < 15) {
      setErrorMessage("Please enter at least 15 characters describing your business problem.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzingClarifications(true);
    setAnalysisStageIndex(0);

    // Staged visual progress transitions
    stageTimerRef.current = setInterval(() => {
      setAnalysisStageIndex((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaText: ideaText.trim(),
          languageCode: selectedLanguage,
        }),
      });

      let data: { error?: string; questions?: ClarificationQuestion[] } | null = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      if (data?.questions && Array.isArray(data.questions)) {
        setClarificationQuestions(data.questions);
        setCurrentStep(2);
      } else {
        throw new Error("No clarification questions returned from analysis.");
      }
    } catch (err: unknown) {
      console.error("Clarification analysis failed:", err);
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Failed to analyze clarifications. Please try again.");
    } finally {
      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current);
        stageTimerRef.current = null;
      }
      setIsAnalyzingClarifications(false);
      setAnalysisStageIndex(0);
    }
  };

  // Step 2 -> Step 3: Generate the full BRD
  const handleGenerateBrd = async (answers: Record<string, string>, useAllAssumptions: boolean) => {
    setIsGeneratingBrd(true);
    setErrorMessage(null);

    try {
      const clarificationsPayload = clarificationQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        assumptionOrAnswer: answers[q.id] || q.defaultAssumption,
      }));

      const res = await fetch("/api/generate-brd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaText: ideaText.trim(),
          clarifications: clarificationsPayload,
          languageCode: selectedLanguage,
        }),
      });

      let data: { error?: string; brd?: StructuredBRD } | null = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Failed to generate BRD (${res.status})`);
      }

      if (data?.brd) {
        setGeneratedBrd(data.brd);
        setCurrentStep(3);
      } else {
        throw new Error("No structured BRD generated in response.");
      }
    } catch (err: unknown) {
      console.error("BRD generation error:", err);
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Failed to generate Business Requirements Document.");
    } finally {
      setIsGeneratingBrd(false);
    }
  };

  // Reset workflow
  const handleReset = () => {
    setCurrentStep(1);
    setIdeaText("");
    setActiveProblemId(null);
    setClarificationQuestions([]);
    setGeneratedBrd(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 dark:bg-charcoal-900 text-ink-900 dark:text-ink-100 selection:bg-forest-100 selection:text-forest-900 dark:selection:bg-forest-900/60 dark:selection:text-forest-200 transition-colors duration-200">
      {/* Top Header */}
      <Header
        isDemo={isDemo}
        onReset={handleReset}
        onOpenConfig={() => setShowConfigModal(true)}
        onExploreSample={handleExploreSampleBrd}
      />

      {/* Demo Mode Notice */}
      <DemoModeBanner isDemo={isDemo} />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* STEP 1 HERO BANNER */}
          {currentStep === 1 && (
            <div className="text-center space-y-4 mb-10 no-print">
              <div className="inline-flex items-center gap-2">
                <span className="document-stamp document-stamp-verified">
                  Built for the way India does business
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 max-w-3xl mx-auto leading-tight">
                Your business idea deserves a clear plan.
              </h1>

              <p className="mx-auto max-w-2xl text-sm sm:text-base text-ink-700 dark:text-ink-300 leading-relaxed">
                Describe the problem in your own words. Turn local business insight into structured requirements, practical next steps, and a plan your team can act on.
              </p>

              {/* Primary & Secondary Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => inputSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-700 text-warm-50 text-xs sm:text-sm font-bold shadow-xs hover:bg-forest-800 transition"
                >
                  Start with your business idea <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleExploreSampleBrd}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs sm:text-sm font-bold text-ink-800 dark:text-ink-200 shadow-2xs hover:bg-warm-100 dark:hover:bg-charcoal-750 hover:border-warm-400 dark:hover:border-charcoal-600 transition"
                >
                  <FileText className="h-4 w-4 text-forest-700 dark:text-forest-400" /> Explore a sample BRD
                </button>
              </div>
            </div>
          )}

          {/* Workflow Stepper */}
          <StepTracker
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step === 1) setCurrentStep(1);
              if (step === 2 && clarificationQuestions.length > 0) setCurrentStep(2);
              if (step === 3 && generatedBrd) setCurrentStep(3);
            }}
            canNavigateToStep={(step) => {
              if (step === 1) return true;
              if (step === 2) return clarificationQuestions.length > 0;
              if (step === 3) return generatedBrd !== null;
              return false;
            }}
          />

          {/* Global Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 flex items-center justify-between gap-3 rounded-md border border-terracotta-200 dark:border-terracotta-800 bg-terracotta-50 dark:bg-terracotta-950/40 p-4 text-xs sm:text-sm text-terracotta-900 dark:text-terracotta-200 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-terracotta-600 dark:text-terracotta-400" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold text-terracotta-800 dark:text-terracotta-300 hover:text-terracotta-950 dark:hover:text-terracotta-100 underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* STEP 1: BUSINESS IDEA INPUT */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Selectable Business-Problem Examples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-ink-900 dark:text-ink-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Common Business Challenges in India</span>
                    <span className="text-[11px] text-ink-500 dark:text-ink-400 font-normal">(Select an example to edit)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_PROBLEMS.map((problem) => {
                    const isSelected = activeProblemId === problem.id;
                    const IconComponent =
                      problem.id === "appointments"
                        ? Users
                        : problem.id === "queues"
                        ? Clock
                        : problem.id === "inventory"
                        ? Package
                        : problem.id === "deliveries"
                        ? Truck
                        : problem.id === "billing"
                        ? Receipt
                        : Rocket;

                    return (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => handleSelectProblem(problem)}
                        className={`p-3.5 rounded-lg border text-left transition-all relative ${
                          isSelected
                            ? "bg-white dark:bg-charcoal-800 border-forest-700 dark:border-forest-500 shadow-xs ring-1 ring-forest-700/20 dark:ring-forest-500/30"
                            : "bg-white/80 dark:bg-charcoal-800/80 border-warm-300 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-800 hover:border-warm-400 dark:hover:border-charcoal-600 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-terracotta-700 dark:text-terracotta-400 bg-terracotta-50 dark:bg-terracotta-950/60 px-1.5 py-0.5 rounded">
                            {problem.category}
                          </span>
                          <IconComponent className="h-4 w-4 text-forest-700 dark:text-forest-400 shrink-0" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-ink-100 leading-snug">
                          {problem.title}
                        </h3>
                        <p className="text-[11px] text-ink-600 dark:text-ink-400 mt-1 line-clamp-2 leading-relaxed">
                          {problem.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Input Card */}
              <div
                ref={inputSectionRef}
                className="rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors"
              >
                {/* Input Mode Selector & Language Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 dark:border-charcoal-700 pb-5">
                  <div className="flex rounded-md bg-warm-100 dark:bg-charcoal-750 p-1 border border-warm-300 dark:border-charcoal-700 w-fit">
                    <button
                      onClick={() => setInputMode("text")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                        inputMode === "text"
                          ? "bg-white dark:bg-charcoal-850 text-ink-900 dark:text-ink-50 shadow-2xs"
                          : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" /> Text Idea
                    </button>
                    <button
                      onClick={() => setInputMode("record")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                        inputMode === "record"
                          ? "bg-white dark:bg-charcoal-850 text-ink-900 dark:text-ink-50 shadow-2xs"
                          : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200"
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" /> Record Voice
                    </button>
                    <button
                      onClick={() => setInputMode("upload")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                        inputMode === "upload"
                          ? "bg-white dark:bg-charcoal-850 text-ink-900 dark:text-ink-50 shadow-2xs"
                          : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200"
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" /> Upload Audio
                    </button>
                  </div>

                  {/* Language Selector with explicit Indic label */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-700 dark:text-ink-300 hidden sm:inline">
                      Language:
                    </span>
                    <LanguageSelector
                      value={selectedLanguage}
                      onChange={(val) => setSelectedLanguage(val)}
                      disabled={isAnalyzingClarifications}
                    />
                  </div>
                </div>

                {/* Sub-modes: Voice Recorder or Audio Uploader */}
                {inputMode === "record" && (
                  <AudioRecorder
                    languageCode={selectedLanguage}
                    onTranscriptionSuccess={(transcript, detectedLang) => {
                      setIdeaText(transcript);
                      if (detectedLang && detectedLang !== "unknown") {
                        setSelectedLanguage(detectedLang as SupportedLanguageCode);
                      }
                      setInputMode("text");
                    }}
                  />
                )}

                {inputMode === "upload" && (
                  <AudioUploader
                    languageCode={selectedLanguage}
                    onTranscriptionSuccess={(transcript, detectedLang) => {
                      setIdeaText(transcript);
                      if (detectedLang && detectedLang !== "unknown") {
                        setSelectedLanguage(detectedLang as SupportedLanguageCode);
                      }
                      setInputMode("text");
                    }}
                  />
                )}

                {/* Main Text Review Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="idea-textarea" className="text-xs font-bold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
                      <span>Business Idea / Problem Statement</span>
                      <span className="text-[11px] text-ink-500 dark:text-ink-400 font-normal">(Edit freely in your language)</span>
                    </label>
                    <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
                      {ideaText.trim().length} chars | {ideaText.trim() ? ideaText.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>

                  <textarea
                    id="idea-textarea"
                    rows={6}
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    placeholder="Describe your business problem or idea in your own words... For example: 'I want to build an appointment and queue management system for a small clinic. Patients should book slots, receive WhatsApp reminders, and see estimated waiting times.'"
                    className="w-full rounded-md border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-850 p-4 text-xs sm:text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-500 leading-relaxed focus:bg-white dark:focus:bg-charcoal-900 focus:border-forest-700 dark:focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-700/20 dark:focus:ring-forest-500/20"
                  />
                </div>

                {/* Action Area with Staged Progress Animation */}
                <div className="pt-2 border-t border-warm-200 dark:border-charcoal-700">
                  {isAnalyzingClarifications ? (
                    <div className="rounded-md bg-warm-100 dark:bg-charcoal-850/90 p-4 border border-warm-300 dark:border-charcoal-700 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-forest-700 dark:text-forest-400" />
                          <span>BhashaBRD Requirement Engine Active</span>
                        </span>
                        <span className="font-mono text-ink-500 dark:text-ink-400">
                          Step {analysisStageIndex + 1} of {ANALYSIS_STAGES.length}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {ANALYSIS_STAGES.map((stageName, idx) => {
                          const isDone = idx < analysisStageIndex;
                          const isCurrent = idx === analysisStageIndex;

                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                                isDone
                                  ? "text-forest-800 dark:text-forest-300 font-semibold"
                                  : isCurrent
                                  ? "text-ink-900 dark:text-ink-50 font-bold"
                                  : "text-ink-400 dark:text-ink-600 opacity-60"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400 shrink-0" />
                              ) : isCurrent ? (
                                <span className="h-2 w-2 rounded-full bg-forest-700 dark:bg-forest-500 animate-ping shrink-0 ml-0.5 mr-1" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-warm-300 dark:bg-charcoal-700 shrink-0 ml-0.5 mr-1" />
                              )}
                              <span>{stageName}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-ink-500 dark:text-ink-400 pt-1">
                        {isDemo
                          ? "Deterministic Simulation Mode • No live API key required"
                          : "Calling Sarvam AI Indic LLM Engine"}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-ink-600 dark:text-ink-400 text-center sm:text-left">
                        Next: BhashaBRD identifies operational decisions & missing assumptions before generating your BRD.
                      </p>

                      <button
                        onClick={handleProceedToClarifications}
                        disabled={ideaText.trim().length < 15}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-forest-700 px-6 py-3 text-xs sm:text-sm font-bold text-warm-50 shadow-xs hover:bg-forest-800 disabled:opacity-50 transition w-full sm:w-auto"
                      >
                        Analyze & Check Clarifications <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLARIFICATIONS & EXPLICIT ASSUMPTIONS */}
          {currentStep === 2 && (
            <ClarificationModal
              questions={clarificationQuestions}
              isDemo={isDemo}
              onProceed={(answers, useAllAssumptions) => handleGenerateBrd(answers, useAllAssumptions)}
              onBack={() => setCurrentStep(1)}
              isGeneratingBrd={isGeneratingBrd}
            />
          )}

          {/* STEP 3: STRUCTURED BRD VIEW & EXPORT */}
          {currentStep === 3 && generatedBrd && (
            <BrdViewer
              brd={generatedBrd}
              onBackToEdit={() => setCurrentStep(2)}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink-900 dark:text-ink-50 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest-700 dark:text-forest-400" /> Sarvam AI Integration
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 p-1 font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
              <p>
                Status:{" "}
                {isDemo ? (
                  <strong className="text-marigold-800 dark:text-marigold-400">Demo Mode Active (Deterministic Simulation)</strong>
                ) : (
                  <strong className="text-forest-800 dark:text-forest-400">Sarvam AI API Connected</strong>
                )}
              </p>
              <p>
                To enable live Indic speech-to-text (Saaras v4) and Sarvam-105B generation, add your API key to{" "}
                <code className="bg-warm-100 dark:bg-charcoal-700 px-1 py-0.5 rounded font-mono text-[11px] text-ink-900 dark:text-ink-100">.env.local</code>:
              </p>
              <pre className="p-3 bg-ink-900 dark:bg-charcoal-950 text-warm-100 dark:text-ink-200 border border-warm-300 dark:border-charcoal-700 rounded font-mono text-[11px] overflow-x-auto">
                SARVAM_API_KEY=your_key_here
              </pre>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                All API requests are routed strictly through server-side Next.js route handlers. The API key is never exposed to the client.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-md bg-forest-700 text-warm-50 text-xs font-bold hover:bg-forest-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-warm-300 dark:border-charcoal-700 bg-white/70 dark:bg-charcoal-900/70 py-6 pb-20 sm:pb-20 text-center text-xs text-ink-600 dark:text-ink-400 no-print transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VyaparVoice. Enterprise Business Requirements Engine for India.</p>
          <div className="flex items-center gap-3 text-[11px] text-ink-500 dark:text-ink-400">
            <span>Powered by BhashaBRD Engine</span>
            <span>•</span>
            <span>Sarvam AI Indic Models</span>
          </div>
        </div>
      </footer>

      {/* Persistent Fixed Brand Philosophy Marquee Bar */}
      <BrandMarquee />
    </div>
  );
}

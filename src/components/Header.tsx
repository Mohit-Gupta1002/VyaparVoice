"use client";

import React from "react";
import { RefreshCw, FileText, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  isDemo: boolean;
  onReset: () => void;
  onOpenConfig?: () => void;
  onExploreSample?: () => void;
}

export function Header({ isDemo, onReset, onOpenConfig, onExploreSample }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-warm-300 dark:border-charcoal-700 bg-warm-50/95 dark:bg-charcoal-900/95 backdrop-blur-md no-print transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-700 text-warm-50 shadow-xs border border-forest-800 dark:border-forest-600">
            {/* Geometric Craftsman Brand Monogram */}
            <svg
              className="h-5 w-5 fill-current text-warm-100"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 4h4l4 10 4-10h4l-6 16h-4L4 4z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
                VyaparVoice
              </span>
              <span className="document-stamp document-stamp-verified hidden sm:inline-flex">
                BhashaBRD
              </span>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-400 font-medium hidden sm:block">
              Built for the way India does business
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {onExploreSample && (
            <button
              onClick={onExploreSample}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 hover:border-warm-400 dark:hover:border-charcoal-600 transition"
              title="Inspect a completed sample 12-section enterprise BRD"
            >
              <FileText className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" />
              <span>Explore Sample BRD</span>
            </button>
          )}

          {/* Demo / Live Status Pill */}
          <button
            onClick={onOpenConfig}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border transition ${
              isDemo
                ? "bg-marigold-50 text-marigold-800 border-marigold-200 hover:bg-marigold-100 dark:bg-marigold-950/40 dark:text-marigold-300 dark:border-marigold-800/60 dark:hover:bg-marigold-950/60"
                : "bg-forest-50 text-forest-800 border-forest-200 hover:bg-forest-100 dark:bg-forest-950/40 dark:text-forest-300 dark:border-forest-800/60 dark:hover:bg-forest-950/60"
            }`}
            title="View Sarvam AI Indic STT and LLM connectivity status"
          >
            {isDemo ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-marigold-500 animate-pulse" />
                <span className="text-[11px] tracking-tight">Demo Mode: Deterministic</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" />
                <span className="text-[11px] tracking-tight">Sarvam AI Live</span>
              </>
            )}
          </button>

          {/* Light / Dark Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-ink-700 dark:text-ink-300 shadow-2xs hover:bg-warm-100 dark:hover:bg-charcoal-750 transition"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-marigold-400" />
            ) : (
              <Moon className="h-4 w-4 text-ink-600" />
            )}
          </button>

          {/* Reset Workflow button */}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-3 py-1.5 text-xs font-semibold text-ink-800 dark:text-ink-200 shadow-2xs hover:bg-warm-100 dark:hover:bg-charcoal-750 hover:border-warm-400 dark:hover:border-charcoal-600 transition"
            title="Start a new business idea"
          >
            <RefreshCw className="h-3.5 w-3.5 text-ink-600 dark:text-ink-400" />
            <span className="hidden sm:inline">New Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
}

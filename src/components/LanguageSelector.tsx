"use client";

import React from "react";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { SupportedLanguageCode } from "@/lib/types";

interface LanguageSelectorProps {
  value: SupportedLanguageCode;
  onChange: (value: SupportedLanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <div className="pointer-events-none absolute left-3 flex items-center text-forest-700 dark:text-forest-400">
        <Globe className="h-4 w-4" aria-hidden="true" />
      </div>
      <label htmlFor="language-select" className="sr-only">
        Select Input Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedLanguageCode)}
        disabled={disabled}
        className="h-10 w-full appearance-none rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 pl-9 pr-9 text-xs sm:text-sm font-semibold text-ink-900 dark:text-ink-100 shadow-2xs hover:border-warm-400 dark:hover:border-charcoal-600 focus:border-forest-700 dark:focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-700/20 dark:focus:ring-forest-500/20 disabled:cursor-not-allowed disabled:bg-warm-100 dark:disabled:bg-charcoal-900 transition"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-charcoal-800 text-ink-900 dark:text-ink-100">
            {lang.nativeName} — {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 flex items-center text-ink-500 dark:text-ink-400">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}

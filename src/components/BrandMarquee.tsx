"use client";

import React from "react";

const BRAND_MESSAGES = [
  "From local ideas to actionable business plans",
  "Voice to structured business requirements",
  "Practical tools for India's everyday businesses",
  "Built for the way India does business",
];

export function BrandMarquee() {
  return (
    <section
      aria-label="Brand Philosophy Marquee"
      className="fixed bottom-0 left-0 right-0 z-20 w-full overflow-hidden border-t border-warm-300 dark:border-charcoal-700 bg-warm-100/95 dark:bg-charcoal-900/95 backdrop-blur-md py-2.5 sm:py-3 transition-colors no-print shadow-[0_-2px_10px_rgba(15,23,42,0.06)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.5)]"
    >
      <div className="marquee-container group">
        {/* Track 1 */}
        <div className="marquee-track flex items-center">
          {BRAND_MESSAGES.map((msg, index) => (
            <div
              key={`track1-${index}`}
              className="flex items-center gap-5 sm:gap-6 shrink-0 px-4 sm:px-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/60 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800">
                BHASHABRD
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-ink-800 dark:text-ink-200">
                {msg}
              </span>
              <span
                className="text-terracotta-600 dark:text-terracotta-400 text-xs select-none"
                aria-hidden="true"
              >
                ◆
              </span>
            </div>
          ))}
          {/* Extended repeat to guarantee full screen coverage on high-res monitors */}
          {BRAND_MESSAGES.map((msg, index) => (
            <div
              key={`track1-dup-${index}`}
              className="flex items-center gap-5 sm:gap-6 shrink-0 px-4 sm:px-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/60 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800">
                BHASHABRD
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-ink-800 dark:text-ink-200">
                {msg}
              </span>
              <span
                className="text-terracotta-600 dark:text-terracotta-400 text-xs select-none"
                aria-hidden="true"
              >
                ◆
              </span>
            </div>
          ))}
        </div>

        {/* Track 2 (Exact duplicate for seamless infinite translation) */}
        <div className="marquee-track flex items-center" aria-hidden="true">
          {BRAND_MESSAGES.map((msg, index) => (
            <div
              key={`track2-${index}`}
              className="flex items-center gap-5 sm:gap-6 shrink-0 px-4 sm:px-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/60 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800">
                BHASHABRD
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-ink-800 dark:text-ink-200">
                {msg}
              </span>
              <span
                className="text-terracotta-600 dark:text-terracotta-400 text-xs select-none"
                aria-hidden="true"
              >
                ◆
              </span>
            </div>
          ))}
          {BRAND_MESSAGES.map((msg, index) => (
            <div
              key={`track2-dup-${index}`}
              className="flex items-center gap-5 sm:gap-6 shrink-0 px-4 sm:px-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/60 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800">
                BHASHABRD
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-ink-800 dark:text-ink-200">
                {msg}
              </span>
              <span
                className="text-terracotta-600 dark:text-terracotta-400 text-xs select-none"
                aria-hidden="true"
              >
                ◆
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

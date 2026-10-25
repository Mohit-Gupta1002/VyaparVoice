"use client";

import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from "lucide-react";

interface DemoModeBannerProps {
  isDemo: boolean;
}

export function DemoModeBanner({ isDemo }: DemoModeBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isDemo) return null;

  const copyConfig = () => {
    navigator.clipboard.writeText("SARVAM_API_KEY=your_actual_sarvam_api_key_here");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-warm-300 dark:border-charcoal-700 bg-marigold-50/70 dark:bg-charcoal-850/80 text-ink-800 dark:text-ink-200 px-4 py-2.5 sm:px-6 text-xs no-print transition-colors">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="document-stamp document-stamp-demo shrink-0">
            DETERMINISTIC SIMULATION
          </span>
          <p className="text-ink-700 dark:text-ink-300 leading-snug">
            Running in <strong>offline demo mode</strong>. Responses are simulated locally using enterprise business templates.{" "}
            <span className="text-ink-500 dark:text-ink-400 hidden md:inline">Output does not come from a live AI model until an API key is connected.</span>
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 font-semibold text-terracotta-700 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 underline underline-offset-2 shrink-0 self-start sm:self-auto"
        >
          {isExpanded ? (
            <>
              Hide setup instructions <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Connect Sarvam AI Live <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mx-auto max-w-7xl mt-3 pt-3 border-t border-warm-200 dark:border-charcoal-700 text-ink-700 dark:text-ink-300 space-y-2">
          <p className="text-xs">
            To enable live Indic speech-to-text (Sarvam Saaras v4) and Sarvam-105B LLM generation, add your API key to{" "}
            <code className="bg-warm-200 dark:bg-charcoal-700 px-1.5 py-0.5 rounded font-mono text-[11px] text-ink-900 dark:text-ink-100">.env.local</code>:
          </p>
          <div className="flex items-center gap-2 max-w-md bg-white dark:bg-charcoal-800 p-2 rounded-md border border-warm-300 dark:border-charcoal-700 shadow-2xs">
            <code className="font-mono text-xs flex-1 text-ink-900 dark:text-ink-100 truncate">
              SARVAM_API_KEY=your_actual_sarvam_api_key_here
            </code>
            <button
              onClick={copyConfig}
              className="inline-flex items-center gap-1 text-[11px] bg-warm-100 dark:bg-charcoal-700 hover:bg-warm-200 dark:hover:bg-charcoal-600 px-2 py-1 rounded text-ink-800 dark:text-ink-200 font-medium transition"
            >
              {copied ? <Check className="h-3 w-3 text-forest-700 dark:text-forest-400" /> : <Copy className="h-3 w-3 text-ink-600 dark:text-ink-400" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-ink-500 dark:text-ink-400">
            Keys are available at{" "}
            <a
              href="https://dashboard.sarvam.ai/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-forest-700 dark:text-forest-400 underline inline-flex items-center gap-0.5"
            >
              dashboard.sarvam.ai <ExternalLink className="h-2.5 w-2.5" />
            </a>
            . API requests are routed strictly through server-side Next.js route handlers.
          </p>
        </div>
      )}
    </div>
  );
}

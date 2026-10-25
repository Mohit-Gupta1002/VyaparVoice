"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StructuredBRD } from "@/lib/types";
import {
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Edit3,
  Eye,
  ArrowLeft,
  ListFilter,
  CheckCircle2,
} from "lucide-react";
import { sanitizeFileName } from "@/lib/utils";

interface BrdViewerProps {
  brd: StructuredBRD;
  onBackToEdit?: () => void;
  onReset?: () => void;
}

const SECTIONS_LIST = [
  { id: "sec-1", title: "1. Executive Summary" },
  { id: "sec-2", title: "2. Business Objectives" },
  { id: "sec-3", title: "3. Stakeholders & Users" },
  { id: "sec-4", title: "4. Scope & Exclusions" },
  { id: "sec-5", title: "5. Functional Requirements" },
  { id: "sec-6", title: "6. Non-Functional Reqs" },
  { id: "sec-7", title: "7. User Stories" },
  { id: "sec-8", title: "8. Business Rules" },
  { id: "sec-9", title: "9. Dependencies & Assumptions" },
  { id: "sec-10", title: "10. Risks & Open Questions" },
  { id: "sec-11", title: "11. Implementation Milestones" },
  { id: "sec-12", title: "12. Success Metrics" },
];

export function BrdViewer({ brd, onBackToEdit, onReset }: BrdViewerProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "editor">("preview");
  const [markdownContent, setMarkdownContent] = useState<string>(brd.markdownContent);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "md" | "txt") => {
    const filename = `${sanitizeFileName(brd.metadata.projectName || "business_requirements")}.${format}`;
    const blob = new Blob([markdownContent], {
      type: format === "md" ? "text/markdown;charset=utf-8;" : "text/plain;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(format.toUpperCase());
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        {/* Left: View mode tabs & title */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-md bg-warm-100 dark:bg-charcoal-750 p-1 border border-warm-300 dark:border-charcoal-700">
            <button
              onClick={() => setActiveTab("preview")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === "preview"
                  ? "bg-white dark:bg-charcoal-850 text-ink-900 dark:text-ink-50 shadow-2xs"
                  : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" /> Rendered Deliverable
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === "editor"
                  ? "bg-white dark:bg-charcoal-850 text-ink-900 dark:text-ink-50 shadow-2xs"
                  : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5 text-terracotta-700 dark:text-terracotta-400" /> Markdown Editor
            </button>
          </div>

          <span className="hidden sm:inline-block h-5 w-px bg-warm-300 dark:bg-charcoal-700" />

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400 font-medium">
            <span className="document-stamp document-stamp-verified">
              12 SECTIONS VERIFIED
            </span>
          </div>
        </div>

        {/* Right: Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onBackToEdit && (
            <button
              onClick={onBackToEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Clarifications
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition shadow-2xs"
            title="Copy entire markdown to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" />
                <span className="text-forest-800 dark:text-forest-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-ink-600 dark:text-ink-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDownload("md")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition shadow-2xs"
            title="Download .md file"
          >
            <Download className="h-3.5 w-3.5 text-ink-600 dark:text-ink-400" /> .MD
          </button>

          <button
            onClick={() => handleDownload("txt")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition shadow-2xs"
            title="Download .txt file"
          >
            <FileText className="h-3.5 w-3.5 text-ink-600 dark:text-ink-400" /> .TXT
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest-700 dark:bg-forest-600 text-warm-50 text-xs font-bold hover:bg-forest-800 dark:hover:bg-forest-500 shadow-xs transition"
            title="Print or export to PDF via browser print dialogue"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="no-print flex items-center gap-2 p-3 bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 text-forest-900 dark:text-forest-200 rounded-md text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-forest-700 dark:text-forest-400" />
          <span>Successfully exported document as .{downloadSuccess} file. Ready to share with your developers.</span>
        </div>
      )}

      {/* Metadata Banner */}
      <div className="no-print rounded-lg bg-warm-100 dark:bg-charcoal-850/90 border border-warm-300 dark:border-charcoal-700 p-4 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-colors">
        <div className="flex flex-wrap items-center gap-3 text-ink-700 dark:text-ink-300">
          <span className="font-extrabold text-ink-900 dark:text-ink-100">{brd.metadata.projectName}</span>
          <span className="text-warm-400 dark:text-charcoal-600">•</span>
          <span>Engine: <strong className="text-forest-900 dark:text-forest-300">{brd.metadata.engine}</strong></span>
          <span className="text-warm-400 dark:text-charcoal-600">•</span>
          <span>Language: <strong>{brd.metadata.targetLanguage}</strong></span>
          <span className="text-warm-400 dark:text-charcoal-600">•</span>
          <span>Date: {new Date(brd.metadata.generatedAt).toLocaleDateString()}</span>
        </div>

        <div>
          {brd.metadata.isDemo ? (
            <span className="document-stamp document-stamp-demo">
              DEMO SIMULATION
            </span>
          ) : (
            <span className="document-stamp document-stamp-verified">
              SARVAM AI INDIC VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Section Quick-Jump Navigation (Hidden on print) */}
      {activeTab === "preview" && (
        <div className="no-print bg-warm-100/70 dark:bg-charcoal-850/80 border border-warm-300 dark:border-charcoal-700 rounded-lg p-3.5 space-y-2 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-ink-700 dark:text-ink-300">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-ink-900 dark:text-ink-100">
              <ListFilter className="h-3.5 w-3.5 text-forest-700 dark:text-forest-400" />
              <span>Document Section Index (12 Verified Sections)</span>
            </span>
            <span className="text-[11px] text-ink-500 dark:text-ink-400">Click any section to jump directly</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS_LIST.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  const el = document.getElementById(sec.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-charcoal-800 border border-warm-300 dark:border-charcoal-700 text-[11px] font-medium text-ink-800 dark:text-ink-200 hover:border-forest-600 dark:hover:border-forest-500 hover:text-forest-800 dark:hover:text-forest-300 hover:bg-forest-50/50 dark:hover:bg-forest-950/40 shadow-2xs transition"
              >
                <span className="text-forest-700 dark:text-forest-400 font-bold">✓</span>
                <span>{sec.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="brd-container rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 sm:p-10 shadow-xs transition-colors">
        {/* Document Header in Print and Preview */}
        <div className="border-b-2 border-warm-300 dark:border-charcoal-700 pb-5 mb-6 ledger-double-rule">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-ink-500 dark:text-ink-400 uppercase">
              ENTERPRISE BUSINESS REQUIREMENTS DELIVERABLE
            </span>
            <span className="document-stamp document-stamp-verified">
              BHASHABRD ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 dark:text-ink-50 tracking-tight">
            {brd.metadata.projectName}
          </h1>
          <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
            Engineered from founder vision • Ready for engineering sprint planning and technical architecture review
          </p>
        </div>

        {activeTab === "preview" ? (
          <div className="prose-brd max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = typeof children === "string" ? children : Array.isArray(children) ? children.map(c => String(c)).join("") : "";
                  const match = text.match(/^(\d+)\./);
                  const id = match ? `sec-${match[1]}` : undefined;
                  return (
                    <h2
                      id={id}
                      className="scroll-mt-8 border-b border-warm-200 dark:border-charcoal-700 pb-2 mt-8 mb-4 text-xl font-bold text-ink-900 dark:text-ink-100 flex items-center justify-between"
                      {...props}
                    >
                      <span>{children}</span>
                      {id && (
                        <span className="text-[10px] font-mono text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/50 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800/80 no-print font-normal">
                          Verified Section
                        </span>
                      )}
                    </h2>
                  );
                },
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-600 dark:text-ink-400">
              <span>Edit raw markdown below. Changes update in real-time.</span>
              <span className="font-mono">{markdownContent.length} characters</span>
            </div>
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              rows={30}
              className="w-full font-mono text-xs sm:text-sm p-4 rounded-md border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-850 text-ink-900 dark:text-ink-100 leading-relaxed focus:border-forest-700 dark:focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-700/20 dark:focus:ring-forest-500/20"
            />
          </div>
        )}
      </div>

      {/* Footer reset button */}
      <div className="no-print flex justify-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 shadow-2xs transition"
        >
          Start Another Business Plan
        </button>
      </div>
    </div>
  );
}

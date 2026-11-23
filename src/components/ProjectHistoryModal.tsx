"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  SavedProject,
  getSavedProjects,
  renameProject,
  deleteProject,
} from "@/lib/storage";
import { StructuredBRD } from "@/lib/types";

interface ProjectHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (brd: StructuredBRD, ideaText?: string) => void;
}

export function ProjectHistoryModal({
  isOpen,
  onClose,
  onLoadProject,
}: ProjectHistoryModalProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProjects(getSavedProjects());
      setEditingId(null);
      setDeleteConfirmId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRename = (project: SavedProject) => {
    setEditingId(project.id);
    setEditingName(project.projectName);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameProject(id, editingName.trim());
      setProjects(getSavedProjects());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(getSavedProjects());
    setDeleteConfirmId(null);
  };

  const handleSelect = (project: SavedProject) => {
    onLoadProject(project.brd, project.ideaText);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-2xl rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 dark:border-charcoal-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-forest-700 text-warm-50">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="history-modal-title"
                className="font-bold text-base text-ink-900 dark:text-ink-50"
              >
                Project History
              </h2>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                {projects.length} saved business requirement {projects.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 p-1 font-bold text-sm"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* LocalStorage Disclosure Alert */}
        <div className="rounded-md bg-warm-100/90 dark:bg-charcoal-850 p-3 border border-warm-300 dark:border-charcoal-700 text-xs text-ink-700 dark:text-ink-300 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-forest-700 dark:text-forest-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong>Browser-Local Storage:</strong> Projects are saved in this browser&apos;s localStorage only. Data is not synchronized to a cloud account. Use <strong>Download .MD</strong> or <strong>Print / PDF</strong> to create permanent local backups.
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {projects.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-10 w-10 text-ink-300 dark:text-charcoal-600 mx-auto" />
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">
                No saved projects found
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400 max-w-sm mx-auto">
                When you generate a Business Requirements Document, it will be automatically saved here so you can review or export it anytime.
              </p>
            </div>
          ) : (
            projects.map((proj) => {
              const isEditing = editingId === proj.id;
              const isConfirmingDelete = deleteConfirmId === proj.id;

              return (
                <div
                  key={proj.id}
                  className="rounded-lg border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-850 p-3.5 hover:border-warm-400 dark:hover:border-charcoal-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 max-w-md">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-ink-900 dark:text-ink-50 flex-1 focus:outline-none focus:ring-1 focus:ring-forest-700"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(proj.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(proj.id)}
                          className="p-1 rounded bg-forest-700 text-warm-50 hover:bg-forest-800"
                          title="Save title"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded border border-warm-300 dark:border-charcoal-700 text-ink-600 dark:text-ink-400 hover:bg-warm-100"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs sm:text-sm text-ink-900 dark:text-ink-50 truncate">
                          {proj.projectName}
                        </h3>
                        <button
                          onClick={() => handleStartRename(proj)}
                          className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 p-0.5"
                          title="Rename project"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-ink-500 dark:text-ink-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(proj.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(proj.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-mono bg-warm-200 dark:bg-charcoal-700 px-1 py-0.5 rounded text-ink-800 dark:text-ink-200">
                        {proj.targetLanguage}
                      </span>
                      <span>•</span>
                      <span>{proj.engine}</span>
                      {proj.isDemo && (
                        <span className="text-marigold-700 dark:text-marigold-400 font-semibold">
                          (Demo Simulation)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-terracotta-700 dark:text-terracotta-400 font-semibold">
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="px-2 py-1 rounded bg-terracotta-700 text-warm-50 text-[11px] font-bold hover:bg-terracotta-800"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded border border-warm-300 dark:border-charcoal-700 text-[11px] text-ink-700 dark:text-ink-300 hover:bg-warm-100"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setDeleteConfirmId(proj.id)}
                          className="p-1.5 rounded text-ink-400 hover:text-terracotta-700 dark:hover:text-terracotta-400 transition"
                          title="Delete saved project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelect(proj)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-forest-700 text-warm-50 text-xs font-bold hover:bg-forest-800 transition"
                        >
                          <ExternalLink className="h-3 w-3" /> Open Plan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-warm-200 dark:border-charcoal-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-warm-300 dark:border-charcoal-700 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:bg-warm-100 dark:hover:bg-charcoal-750 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

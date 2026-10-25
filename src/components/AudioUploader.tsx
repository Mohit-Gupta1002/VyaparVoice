"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileAudio, Trash2, Send, AlertCircle, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { SupportedLanguageCode } from "@/lib/types";

interface AudioUploaderProps {
  languageCode: SupportedLanguageCode;
  onTranscriptionSuccess: (transcript: string, detectedLang?: string) => void;
}

export function AudioUploader({ languageCode, onTranscriptionSuccess }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URL on unmount or URL replacement
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB

    if (file.size > MAX_SIZE) {
      setErrorMessage("File exceeds 25MB limit. Please upload a smaller audio clip.");
      return;
    }

    const validExtensions = ["wav", "mp3", "m4a", "webm", "ogg", "aac", "flac"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format (.${ext}). Supported formats: ${validExtensions.join(", ")}`);
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language_code", languageCode);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      let data: { error?: string; transcript?: string; language_code?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Server returned status ${res.status}`);
      }

      if (data?.transcript) {
        onTranscriptionSuccess(data.transcript, data.language_code);
      } else {
        throw new Error("No transcription text returned from speech model.");
      }
    } catch (err: unknown) {
      console.error("Upload transcription error:", err);
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Failed to transcribe audio file.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 border border-dashed border-warm-300 dark:border-charcoal-700 rounded-lg bg-warm-50/60 dark:bg-charcoal-850/60 text-center transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg,.aac,.flac"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        aria-label="Upload Audio File"
      />

      {errorMessage && (
        <div className="w-full mb-4 flex items-center gap-2 p-3 text-xs bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-800 text-terracotta-900 dark:text-terracotta-200 rounded-md text-left">
          <AlertCircle className="h-4 w-4 shrink-0 text-terracotta-600 dark:text-terracotta-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {selectedFile && audioUrl ? (
        <div className="w-full flex flex-col items-center space-y-4 max-w-md">
          <div className="flex items-center gap-3 bg-white dark:bg-charcoal-800 px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 shadow-2xs w-full justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <FileAudio className="h-5 w-5 text-forest-700 dark:text-forest-400 shrink-0" />
              <div className="text-left truncate">
                <p className="text-xs font-bold text-ink-900 dark:text-ink-100 truncate">{selectedFile.name}</p>
                <p className="text-[11px] font-mono text-ink-500 dark:text-ink-400">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>

            <button
              onClick={clearFile}
              className="text-ink-400 hover:text-terracotta-700 dark:hover:text-terracotta-400 transition p-1"
              title="Remove audio file"
              aria-label="Remove audio file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <audio src={audioUrl} controls className="w-full max-w-md h-9" />

          <div className="flex items-center gap-3">
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-forest-700 text-warm-50 text-xs font-bold hover:bg-forest-800 shadow-xs disabled:opacity-60 transition"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Transcribing with Sarvam AI...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Transcribe Audio File
                </>
              )}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isTranscribing}
              className="px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 text-ink-700 dark:text-ink-300 text-xs font-semibold hover:bg-white dark:hover:bg-charcoal-750 transition"
            >
              Change File
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center space-y-3 cursor-pointer p-6 rounded-md transition w-full ${
            isDragging
              ? "bg-forest-50/70 dark:bg-forest-950/40 border border-forest-600 dark:border-forest-500"
              : "hover:bg-warm-100/60 dark:hover:bg-charcoal-800/60"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
          aria-label="Drag and drop or browse audio file"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 dark:bg-charcoal-800 text-forest-700 dark:text-forest-400 border border-warm-300 dark:border-charcoal-700 shadow-2xs">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-ink-100">
              Drag & drop audio note or <span className="text-forest-700 dark:text-forest-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Supports WAV, MP3, M4A, WebM, OGG, AAC up to 25MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

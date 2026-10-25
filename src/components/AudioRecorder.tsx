"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send, AlertCircle, Loader2 } from "lucide-react";
import { SupportedLanguageCode } from "@/lib/types";

interface AudioRecorderProps {
  languageCode: SupportedLanguageCode;
  onTranscriptionSuccess: (transcript: string, detectedLang?: string) => void;
}

export function AudioRecorder({ languageCode, onTranscriptionSuccess }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 20, 25, 20, 15]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up timer, audio context, and object URLs on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support microphone audio recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Live Web Audio frequency analysis for genuine waveform visualization
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtxClass();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeters = () => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
          analyser.getByteFrequencyData(dataArray);

          // Sample 12 representative frequency bands
          const bars: number[] = [];
          const step = Math.max(1, Math.floor(dataArray.length / 12));
          for (let i = 0; i < 12; i++) {
            const val = dataArray[i * step] || 0;
            // Normalize value between 15% and 100% height
            const normalized = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
            bars.push(normalized);
          }
          setAudioLevels(bars);
          animationFrameRef.current = requestAnimationFrame(updateMeters);
        };
        animationFrameRef.current = requestAnimationFrame(updateMeters);
      } catch (audioErr) {
        console.warn("Web Audio Analyser not supported, using fallback static indicator", audioErr);
      }

      // Determine supported mimeType
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }

        const fullBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);

        // Stop all media tracks to release microphone hardware light
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error("Microphone access error:", err);
      const errorObj = err as Error;
      if (errorObj.name === "NotAllowedError" || errorObj.name === "PermissionDeniedError") {
        setErrorMessage("Microphone permission was denied. Please allow microphone access in your browser settings.");
      } else {
        setErrorMessage(errorObj.message || "Failed to start audio recording.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setRecordingDuration(0);
    setErrorMessage(null);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice-recording.webm");
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
        throw new Error(data?.error || `Server returned error (${res.status})`);
      }

      if (data?.transcript) {
        onTranscriptionSuccess(data.transcript, data.language_code);
      } else {
        throw new Error("No transcription text returned from speech model.");
      }
    } catch (err: unknown) {
      console.error("Transcription error:", err);
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Could not transcribe audio recording.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 border border-dashed border-warm-300 dark:border-charcoal-700 rounded-lg bg-warm-50/60 dark:bg-charcoal-850/60 text-center transition-colors">
      {errorMessage && (
        <div className="w-full mb-4 flex items-center gap-2 p-3 text-xs bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-800 text-terracotta-900 dark:text-terracotta-200 rounded-md text-left">
          <AlertCircle className="h-4 w-4 shrink-0 text-terracotta-600 dark:text-terracotta-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording in progress */}
      {isRecording && (
        <div className="flex flex-col items-center space-y-4 w-full max-w-md">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-terracotta-600 animate-ping" />
            <span className="font-mono text-xl font-extrabold text-ink-900 dark:text-ink-100">
              {formatTimer(recordingDuration)}
            </span>
            <span className="text-xs font-semibold text-terracotta-700 dark:text-terracotta-400 uppercase tracking-wider ml-1">
              Live Recording
            </span>
          </div>

          {/* Genuine real-time audio waveform meter */}
          <div
            className="flex items-center justify-center gap-1.5 h-16 w-full px-6 py-2 bg-white dark:bg-charcoal-800 rounded-md border border-warm-300 dark:border-charcoal-700 shadow-inner"
            aria-label="Microphone Audio Waveform Level Meter"
          >
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1.5 bg-forest-600 dark:bg-forest-400 rounded-full transition-all duration-75"
                style={{ height: `${lvl}%` }}
              />
            ))}
          </div>

          <p className="text-xs text-ink-600 dark:text-ink-400">
            Speak in Hindi, English, Marathi, Tamil, or any Indic language. Describe your problem naturally.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-700 text-warm-50 text-xs font-bold hover:bg-forest-800 shadow-xs transition"
            >
              <Square className="h-4 w-4 fill-current" /> Stop Recording
            </button>
            <button
              onClick={cancelRecording}
              className="px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 text-ink-700 dark:text-ink-300 text-xs font-semibold hover:bg-warm-100 dark:hover:bg-charcoal-750 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Audio recorded & ready to transcribe */}
      {!isRecording && audioBlob && audioUrl && (
        <div className="w-full flex flex-col items-center space-y-4 max-w-md">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-3 bg-white dark:bg-charcoal-800 px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 shadow-2xs w-full justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={togglePlayback}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-forest-700 text-warm-50 hover:bg-forest-800 transition"
                title={isPlaying ? "Pause audio review" : "Play audio review"}
                aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <div className="text-left">
                <p className="text-xs font-bold text-ink-900 dark:text-ink-100">Voice Note Captured</p>
                <p className="text-[11px] font-mono text-ink-500 dark:text-ink-400">Duration: {formatTimer(recordingDuration)}</p>
              </div>
            </div>

            <button
              onClick={cancelRecording}
              className="text-ink-400 hover:text-terracotta-700 dark:hover:text-terracotta-400 transition p-1"
              title="Delete and record again"
              aria-label="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

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
                  <Send className="h-4 w-4" /> Convert to Business Text
                </>
              )}
            </button>
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="px-4 py-2.5 rounded-md border border-warm-300 dark:border-charcoal-700 text-ink-700 dark:text-ink-300 text-xs font-semibold hover:bg-white dark:hover:bg-charcoal-750 transition"
            >
              Re-record
            </button>
          </div>
        </div>
      )}

      {/* Initial state: Ready to record */}
      {!isRecording && !audioBlob && (
        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={startRecording}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-warm-100 dark:bg-charcoal-800 border border-warm-300 dark:border-charcoal-700 text-forest-700 dark:text-forest-400 hover:bg-forest-700 hover:text-warm-50 hover:border-forest-700 dark:hover:bg-forest-600 dark:hover:text-warm-50 shadow-2xs transition-all duration-200"
            title="Click to start microphone recording"
            aria-label="Start voice recording"
          >
            <Mic className="h-7 w-7 transition-transform group-hover:scale-110" />
          </button>
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-ink-100">Record Your Business Idea</p>
            <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5">
              Speak naturally in Hindi, English, Marathi, Tamil, or your native language
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

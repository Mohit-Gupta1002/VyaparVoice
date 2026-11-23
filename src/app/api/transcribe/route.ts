import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, transcribeAudioWithSarvam } from "@/lib/sarvam";
import { transcribeAudioWithWhisper, isWhisperConfigured } from "@/lib/whisper";
import { SpeechProvider, SupportedLanguageCode, TranscriptionResponse } from "@/lib/types";

export const maxDuration = 60; // Allow 60s for audio processing

const SUPPORTED_EXTENSIONS = [".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac", ".aac"];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

function isSupportedAudioFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const languageCode = (formData.get("language_code") as SupportedLanguageCode) || "unknown";
    const requestedProvider = (
      (formData.get("provider") as string) ||
      req.nextUrl.searchParams.get("provider") ||
      process.env.ASR_PROVIDER ||
      "auto"
    ).toLowerCase() as SpeechProvider;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided in request." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Audio file is empty (0 bytes)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum size limit of 25MB." },
        { status: 413 }
      );
    }

    const fileName = file.name || "recording.webm";
    if (!isSupportedAudioFile(fileName)) {
      return NextResponse.json(
        {
          error: `Unsupported audio format. Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- Provider Strategy: Explicit Whisper ---
    if (requestedProvider === "whisper") {
      try {
        const whisperResult = await transcribeAudioWithWhisper(buffer, fileName, languageCode);
        return NextResponse.json(whisperResult);
      } catch (whisperErr: any) {
        console.error("Explicit Whisper transcription error:", whisperErr);
        const isTimeout = whisperErr.name === "TimeoutError" || whisperErr.message?.includes("timeout");
        return NextResponse.json(
          { error: `Whisper transcription failed: ${whisperErr.message}` },
          { status: isTimeout ? 504 : 502 }
        );
      }
    }

    // --- Provider Strategy: Explicit Sarvam ---
    if (requestedProvider === "sarvam") {
      if (isDemoMode()) {
        return NextResponse.json(
          { error: "Sarvam AI API key is not configured. Please set SARVAM_API_KEY in .env.local" },
          { status: 401 }
        );
      }
      try {
        const sarvamResult = await transcribeAudioWithSarvam(buffer, fileName, languageCode);
        const normalized: TranscriptionResponse = {
          transcript: sarvamResult.transcript,
          language_code: sarvamResult.language_code,
          request_id: sarvamResult.request_id,
          isDemo: false,
          provider: "sarvam",
        };
        return NextResponse.json(normalized);
      } catch (sarvamErr: any) {
        console.error("Explicit Sarvam transcription error:", sarvamErr);
        return NextResponse.json(
          { error: `Sarvam transcription failed: ${sarvamErr.message}` },
          { status: 500 }
        );
      }
    }

    // --- Provider Strategy: AUTO with graceful fallback ---
    // 1. Try local/custom Whisper service if configured or available
    if (isWhisperConfigured() || process.env.WHISPER_API_URL) {
      try {
        const whisperResult = await transcribeAudioWithWhisper(buffer, fileName, languageCode);
        return NextResponse.json(whisperResult);
      } catch (whisperErr: any) {
        console.warn("Auto-provider: Whisper service unavailable, attempting fallback:", whisperErr.message);
      }
    }

    // 2. Try Sarvam AI if API key is configured
    if (!isDemoMode()) {
      try {
        const sarvamResult = await transcribeAudioWithSarvam(buffer, fileName, languageCode);
        const normalized: TranscriptionResponse = {
          transcript: sarvamResult.transcript,
          language_code: sarvamResult.language_code,
          request_id: sarvamResult.request_id,
          isDemo: false,
          provider: "sarvam",
        };
        return NextResponse.json(normalized);
      } catch (sarvamErr: any) {
        console.warn("Auto-provider: Sarvam API failed, falling back to Demo mode:", sarvamErr.message);
      }
    }

    // 3. Fallback: Deterministic Demo Mode (Zero-Config guarantee)
    return NextResponse.json({
      transcript:
        "I want to build an appointment and queue management system for a small clinic. Patients should book appointments, receive reminders, and see their estimated waiting time. Clinic staff should manage appointments and mark patients as arrived.",
      language_code: languageCode === "unknown" ? "en-IN" : languageCode,
      request_id: `demo_${Date.now()}`,
      isDemo: true,
      provider: "demo",
    });
  } catch (error: any) {
    console.error("Transcribe API Fatal Error:", error);
    const status = error.message?.includes("401")
      ? 401
      : error.message?.includes("413")
      ? 413
      : error.message?.includes("400")
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: error.message || "Failed to process audio transcription.",
      },
      { status }
    );
  }
}

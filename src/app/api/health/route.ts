import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/sarvam";
import { getWhisperApiUrl, isWhisperConfigured } from "@/lib/whisper";

export async function GET() {
  const isDemo = isDemoMode();
  return NextResponse.json({
    status: "ok",
    app: "VyaparVoice",
    engine: "BhashaBRD",
    isDemo,
    sarvamConfigured: !isDemo,
    whisperConfigured: isWhisperConfigured(),
    whisperUrl: getWhisperApiUrl(),
    asrProvider: (process.env.ASR_PROVIDER || "auto").toLowerCase(),
    chatModel: process.env.SARVAM_CHAT_MODEL || "sarvam-105b",
    sttModel: process.env.SARVAM_STT_MODEL || "saaras:v4",
    timestamp: new Date().toISOString(),
  });
}

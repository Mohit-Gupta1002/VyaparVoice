import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/sarvam";

export async function GET() {
  const isDemo = isDemoMode();
  return NextResponse.json({
    status: "ok",
    app: "VyaparVoice",
    engine: "BhashaBRD",
    isDemo,
    sarvamConfigured: !isDemo,
    chatModel: process.env.SARVAM_CHAT_MODEL || "sarvam-105b",
    sttModel: process.env.SARVAM_STT_MODEL || "saaras:v4",
    timestamp: new Date().toISOString(),
  });
}

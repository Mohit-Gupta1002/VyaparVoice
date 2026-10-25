import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, transcribeAudioWithSarvam } from "@/lib/sarvam";
import { SupportedLanguageCode } from "@/lib/types";

export const maxDuration = 60; // Allow 60s for audio processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const languageCode = (formData.get("language_code") as SupportedLanguageCode) || "unknown";

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided in request." },
        { status: 400 }
      );
    }

    // Check file size (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum size limit of 25MB." },
        { status: 400 }
      );
    }

    // Check if DEMO MODE should be used
    if (isDemoMode()) {
      return NextResponse.json({
        transcript:
          "I want to build an appointment and queue management system for a small clinic. Patients should book appointments, receive reminders, and see their estimated waiting time. Clinic staff should manage appointments and mark patients as arrived.",
        language_code: languageCode === "unknown" ? "en-IN" : languageCode,
        request_id: `demo_${Date.now()}`,
        isDemo: true,
      });
    }

    // Call official Sarvam STT
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await transcribeAudioWithSarvam(buffer, file.name || "recording.webm", languageCode);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Transcribe API Error:", error);
    const status = error.message?.includes("401")
      ? 401
      : error.message?.includes("429")
      ? 429
      : error.message?.includes("400")
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: error.message || "Failed to transcribe audio with Sarvam AI.",
      },
      { status }
    );
  }
}

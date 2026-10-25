import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, generateClarificationsWithSarvam } from "@/lib/sarvam";
import { DEMO_CLARIFICATION_QUESTIONS } from "@/lib/demo-data";
import { SupportedLanguageCode } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ideaText, languageCode = "en-IN" } = body;

    if (!ideaText || typeof ideaText !== "string" || ideaText.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a more detailed business idea (at least 15 characters)." },
        { status: 400 }
      );
    }

    if (isDemoMode()) {
      return NextResponse.json({
        questions: DEMO_CLARIFICATION_QUESTIONS,
        isDemo: true,
        modelUsed: "Deterministic Simulation (Demo Mode)",
      });
    }

    const result = await generateClarificationsWithSarvam(ideaText.trim(), languageCode as SupportedLanguageCode);
    return NextResponse.json({
      questions: result.questions,
      isDemo: false,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("Clarify API Error:", error);
    const status = error.message?.includes("401")
      ? 401
      : error.message?.includes("429")
      ? 429
      : error.message?.includes("400")
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: error.message || "Failed to analyze business idea clarifications.",
      },
      { status }
    );
  }
}

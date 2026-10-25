import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, generateBrdWithSarvam } from "@/lib/sarvam";
import { generateDemoBRD } from "@/lib/demo-data";
import { SupportedLanguageCode } from "@/lib/types";

export const maxDuration = 60; // Allow 60s for full BRD generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ideaText, clarifications = [], languageCode = "en-IN" } = body;

    if (!ideaText || typeof ideaText !== "string" || ideaText.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a valid business idea description (at least 15 characters)." },
        { status: 400 }
      );
    }

    if (isDemoMode()) {
      // Build answers map from clarifications
      const answersMap: Record<string, string> = {};
      if (Array.isArray(clarifications)) {
        for (const item of clarifications) {
          if (item.id && item.assumptionOrAnswer) {
            answersMap[item.id] = item.assumptionOrAnswer;
          }
        }
      }

      const demoBrd = generateDemoBRD(ideaText.trim(), answersMap);
      return NextResponse.json({
        brd: demoBrd,
        isDemo: true,
        modelUsed: "Deterministic Simulation (Demo Mode)",
      });
    }

    const result = await generateBrdWithSarvam(
      ideaText.trim(),
      clarifications,
      languageCode as SupportedLanguageCode
    );

    return NextResponse.json({
      brd: result.brd,
      isDemo: false,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("Generate BRD API Error:", error);
    const status = error.message?.includes("401")
      ? 401
      : error.message?.includes("429")
      ? 429
      : error.message?.includes("400")
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: error.message || "Failed to generate Business Requirements Document.",
      },
      { status }
    );
  }
}

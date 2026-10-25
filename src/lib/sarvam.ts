import { ClarificationQuestion, StructuredBRD, SupportedLanguageCode } from "./types";
import { convertStructuredBrdToMarkdown } from "./demo-data";

const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || "https://api.sarvam.ai";
const SARVAM_CHAT_MODEL = process.env.SARVAM_CHAT_MODEL || "sarvam-105b";
const SARVAM_STT_MODEL = process.env.SARVAM_STT_MODEL || "saaras:v4";

export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY;
  if (!key || key.trim() === "" || key === "your_api_key_here") {
    return null;
  }
  return key.trim();
}

export function isDemoMode(): boolean {
  return getSarvamApiKey() === null;
}

export interface SarvamTranscriptionResult {
  transcript: string;
  language_code: string;
  request_id?: string;
  isDemo: boolean;
}

/**
 * Transcribes audio via Sarvam Saaras v4 STT API
 */
export async function transcribeAudioWithSarvam(
  fileBuffer: Buffer | Blob,
  fileName: string,
  languageCode: SupportedLanguageCode = "unknown"
): Promise<SarvamTranscriptionResult> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const formData = new FormData();
  if (fileBuffer instanceof Blob) {
    formData.append("file", fileBuffer, fileName);
  } else {
    const uint8 = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8]);
    formData.append("file", blob, fileName);
  }

  formData.append("model", SARVAM_STT_MODEL);
  if (languageCode && languageCode !== "unknown") {
    formData.append("language_code", languageCode);
  }
  formData.append("mode", "transcribe");

  const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
    body: formData,
    signal: AbortSignal.timeout(45000), // 45s timeout for audio processing
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMessage = errorText;
    try {
      const parsed = JSON.parse(errorText);
      parsedMessage = parsed.message || parsed.error || errorText;
    } catch {
      // use raw text
    }
    throw new Error(`Sarvam STT API returned ${response.status}: ${parsedMessage}`);
  }

  const data = await response.json();
  return {
    transcript: data.transcript || "",
    language_code: data.language_code || languageCode,
    request_id: data.request_id,
    isDemo: false,
  };
}

/**
 * Robust helper to extract and parse JSON from model responses
 * Handles clean JSON, markdown-fenced JSON, or JSON with conversational prefix/suffix
 */
export function extractJsonFromText(rawText: string): any {
  const trimmed = rawText.trim();
  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {
    // 2. Extract from markdown fence ```json ... ```
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {
        // Continue to brace extraction
      }
    }
    // 3. Extract between outermost curly braces
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1).trim());
    }
    throw new Error("Unable to locate valid JSON structure in model response.");
  }
}

/**
 * Generates clarification questions using Sarvam Chat Completion API
 */
export async function generateClarificationsWithSarvam(
  ideaText: string,
  languageCode: SupportedLanguageCode = "en-IN"
): Promise<{ questions: ClarificationQuestion[]; modelUsed: string }> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const prompt = `You are BhashaBRD, an expert senior business analyst and requirements engineer.
Analyze the following business idea carefully:
"""
${ideaText}
"""

Identify the top 3 or 4 critical missing requirements, operational ambiguities, or scope decisions needed to produce an enterprise-grade Business Requirements Document (BRD).
For each question, formulate a sound, realistic DEFAULT ASSUMPTION that can be used if the user chooses to proceed immediately.

Respond strictly in valid JSON format matching this schema:
{
  "questions": [
    {
      "id": "Q-1",
      "question": "Clear, precise clarification question",
      "context": "Why this information is critical for the BRD",
      "defaultAssumption": "Specific operational assumption to adopt if unconfirmed"
    }
  ]
}
Do not include markdown fences like \`\`\`json. Output raw JSON only.`;

  const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      model: SARVAM_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are BhashaBRD, a senior business requirements analyst. Output pure valid JSON without commentary or code fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sarvam Chat API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || "";

  try {
    const parsed = extractJsonFromText(rawContent);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        questions: parsed.questions,
        modelUsed: result.model || SARVAM_CHAT_MODEL,
      };
    }
  } catch (err) {
    console.error("Failed to parse Sarvam clarification JSON:", rawContent, err);
  }

  throw new Error("Sarvam model returned an invalid response structure for clarification questions.");
}

/**
 * Generates full structured 12-section BRD using Sarvam Chat Completion API
 */
export async function generateBrdWithSarvam(
  ideaText: string,
  clarifications: Array<{ id: string; question: string; assumptionOrAnswer: string }> = [],
  languageCode: SupportedLanguageCode = "en-IN"
): Promise<{ brd: StructuredBRD; modelUsed: string }> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const assumptionsText = (clarifications || [])
    .map((c) => `- [${c.id}] ${c.question}: ${c.assumptionOrAnswer}`)
    .join("\n");

  const prompt = `You are BhashaBRD, an elite requirements engineer creating a professional Business Requirements Document (BRD).
Business Idea Description:
"""
${ideaText}
"""

Agreed Clarifications & Explicit Assumptions:
"""
${assumptionsText || "None specified."}
"""

Target Language: ${languageCode}

Create a comprehensive, highly specific, professional BRD adhering strictly to the provided idea. Never present assumptions as verified facts.
The output MUST be a valid JSON object following this exact schema:
{
  "metadata": {
    "projectName": "Project Title",
    "targetLanguage": "${languageCode}",
    "generatedAt": "${new Date().toISOString()}",
    "engine": "BhashaBRD",
    "isDemo": false,
    "modelUsed": "${SARVAM_CHAT_MODEL}"
  },
  "summary": {
    "executiveSummary": "...",
    "problemStatement": "...",
    "proposedSolution": "..."
  },
  "businessObjectives": ["Objective 1", "Objective 2", "Objective 3", "Objective 4"],
  "stakeholders": [
    { "role": "...", "responsibilities": "..." }
  ],
  "scope": {
    "inScope": ["...", "..."],
    "outOfScope": ["...", "..."]
  },
  "functionalRequirements": [
    { "id": "FR-001", "title": "...", "description": "...", "priority": "High" | "Medium" | "Low" }
  ],
  "nonFunctionalRequirements": [
    { "id": "NFR-001", "category": "Performance" | "Security" | "Reliability" | "Usability" | "Compliance", "description": "...", "metric": "..." }
  ],
  "userStories": [
    {
      "id": "US-001",
      "role": "...",
      "action": "...",
      "benefit": "...",
      "acceptanceCriteria": ["Given ..., when ..., then ..."]
    }
  ],
  "businessRules": [
    { "id": "BR-001", "rule": "...", "impact": "..." }
  ],
  "dependenciesAndAssumptions": {
    "dependencies": [{ "id": "DEP-001", "description": "..." }],
    "assumptions": [{ "id": "ASM-001", "description": "...", "impactIfNotMet": "..." }]
  },
  "risksAndOpenQuestions": {
    "risks": [{ "id": "RSK-001", "risk": "...", "mitigation": "...", "severity": "High" | "Medium" | "Low" }],
    "openQuestions": ["Question 1", "Question 2"]
  },
  "milestones": [
    { "id": "M-001", "phase": "...", "deliverables": ["..."], "estimatedWeeks": 2 }
  ],
  "successMetrics": [
    { "id": "SM-001", "metric": "...", "target": "...", "measurementMethod": "..." }
  ]
}

Ensure all 12 sections are thoroughly populated, specific, and professional. Return raw JSON without code markdown blocks.`;

  const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      model: SARVAM_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are BhashaBRD, an enterprise software requirements architect. Output pure valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.25,
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(60000), // 60s timeout for large generation
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sarvam Chat API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || "";

  try {
    const parsed = extractJsonFromText(rawContent) as StructuredBRD;
    parsed.metadata.isDemo = false;
    parsed.metadata.engine = "BhashaBRD";
    parsed.metadata.modelUsed = result.model || SARVAM_CHAT_MODEL;
    parsed.markdownContent = convertStructuredBrdToMarkdown(parsed);
    return {
      brd: parsed,
      modelUsed: result.model || SARVAM_CHAT_MODEL,
    };
  } catch (err) {
    console.error("Failed to parse Sarvam BRD JSON:", rawContent, err);
    throw new Error("Sarvam model returned an unparseable response structure for the BRD.");
  }
}

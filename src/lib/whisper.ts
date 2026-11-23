import { SupportedLanguageCode, TranscriptionResponse } from "./types";

const DEFAULT_WHISPER_URL = "http://127.0.0.1:8000/api/speech/transcribe";

export function getWhisperApiUrl(): string {
  const url = process.env.WHISPER_API_URL;
  if (!url || url.trim() === "") {
    return DEFAULT_WHISPER_URL;
  }
  return url.trim();
}

export function isWhisperConfigured(): boolean {
  return Boolean(process.env.WHISPER_API_URL && process.env.WHISPER_API_URL.trim() !== "");
}

/**
 * Transcribes audio via the local / self-hosted FastAPI faster-whisper service.
 */
export async function transcribeAudioWithWhisper(
  fileBuffer: Buffer | Blob,
  fileName: string,
  languageCode: SupportedLanguageCode = "unknown"
): Promise<TranscriptionResponse> {
  const whisperUrl = getWhisperApiUrl();

  const formData = new FormData();
  if (fileBuffer instanceof Blob) {
    formData.append("file", fileBuffer, fileName);
  } else {
    const uint8 = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8]);
    formData.append("file", blob, fileName);
  }

  if (languageCode && languageCode !== "unknown") {
    formData.append("language", languageCode);
  }

  const response = await fetch(whisperUrl, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(45000), // 45s timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.detail || parsed.error || errorText;
    } catch {
      // Use raw text
    }
    throw new Error(`Whisper backend returned ${response.status}: ${message}`);
  }

  const data = await response.json();

  return {
    transcript: data.transcript || "",
    language_code: data.language_code || data.language || (languageCode === "unknown" ? "en" : languageCode),
    request_id: `whisper_${Date.now()}`,
    isDemo: false,
    provider: "whisper",
    duration_seconds: data.duration_seconds,
    processing_time_ms: data.processing_time_ms,
    model_used: data.model_used || "faster-whisper",
    segments: data.segments,
  };
}

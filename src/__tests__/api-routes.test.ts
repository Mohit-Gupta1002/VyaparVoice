import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as healthHandler } from "../app/api/health/route";
import { POST as clarifyHandler } from "../app/api/clarify/route";
import { POST as generateBrdHandler } from "../app/api/generate-brd/route";
import { POST as transcribeHandler } from "../app/api/transcribe/route";

describe("API Integration Test Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SARVAM_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // 1. Health Endpoint Tests
  describe("GET /api/health", () => {
    it("reports system status, models, and demo mode when no Sarvam key is set", async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("ok");
      expect(data.app).toBe("VyaparVoice");
      expect(data.engine).toBe("BhashaBRD");
      expect(data.isDemo).toBe(true);
      expect(data.sarvamConfigured).toBe(false);
      expect(data.asrProvider).toBe("auto");
      expect(data.sttModel).toBe("saaras:v4");
      expect(data.chatModel).toBe("sarvam-105b");
      expect(data.timestamp).toBeTruthy();
    });
  });

  // 2. Clarification Endpoint Tests
  describe("POST /api/clarify", () => {
    it("rejects ideas shorter than 15 characters with 400 Bad Request", async () => {
      const req = new NextRequest("http://localhost:3000/api/clarify", {
        method: "POST",
        body: JSON.stringify({ ideaText: "short" }),
      });

      const res = await clarifyHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("at least 15 characters");
    });

    it("returns deterministic clarification questions in demo mode", async () => {
      const req = new NextRequest("http://localhost:3000/api/clarify", {
        method: "POST",
        body: JSON.stringify({
          ideaText: "Build an appointment system for our local clinic with walk-in token tracking",
          languageCode: "en-IN",
        }),
      });

      const res = await clarifyHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isDemo).toBe(true);
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBeGreaterThanOrEqual(4);
      expect(data.questions[0].id).toBeTruthy();
      expect(data.questions[0].defaultAssumption).toBeTruthy();
    });
  });

  // 3. BRD Generation Endpoint Tests
  describe("POST /api/generate-brd", () => {
    it("validates input length and rejects insufficient ideas with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/generate-brd", {
        method: "POST",
        body: JSON.stringify({ ideaText: "too brief" }),
      });

      const res = await generateBrdHandler(req);
      expect(res.status).toBe(400);
    });

    it("generates a complete 12-section BRD in demo mode", async () => {
      const req = new NextRequest("http://localhost:3000/api/generate-brd", {
        method: "POST",
        body: JSON.stringify({
          ideaText: "Appointment and queue token management system for small Indian healthcare clinics.",
          clarifications: [
            { id: "Q-1", assumptionOrAnswer: "Advance appointments and walk-in queue tokens supported." },
          ],
          languageCode: "en-IN",
        }),
      });

      const res = await generateBrdHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isDemo).toBe(true);
      expect(data.brd).toBeDefined();
      expect(data.brd.metadata.projectName).toBeTruthy();
      expect(data.brd.functionalRequirements.length).toBeGreaterThan(0);
      expect(data.brd.nonFunctionalRequirements.length).toBeGreaterThan(0);
      expect(data.brd.markdownContent).toBeTruthy();
    });
  });

  // 4. Speech Pipeline Transcribe Endpoint Tests
  describe("POST /api/transcribe", () => {
    it("returns 400 if no file is provided", async () => {
      const formData = new FormData();
      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("No audio file provided");
    });

    it("returns 400 if audio file is 0 bytes", async () => {
      const formData = new FormData();
      const emptyBlob = new Blob([], { type: "audio/wav" });
      formData.append("file", emptyBlob, "empty.wav");

      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("empty (0 bytes)");
    });

    it("returns 400 if audio file extension is unsupported", async () => {
      const formData = new FormData();
      const textBlob = new Blob(["test text"], { type: "text/plain" });
      formData.append("file", textBlob, "malicious.exe");

      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Unsupported audio format");
    });

    it("returns deterministic demo transcription when in auto mode and no external services are configured", async () => {
      const formData = new FormData();
      const fakeAudio = new Blob(["fake audio stream bytes"], { type: "audio/wav" });
      formData.append("file", fakeAudio, "test.wav");
      formData.append("language_code", "en-IN");
      formData.append("provider", "demo");

      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isDemo).toBe(true);
      expect(data.provider).toBe("demo");
      expect(data.transcript).toBeTruthy();
      expect(data.transcript).toContain("appointment");
    });

    it("routes to Whisper provider when requested and normalizes response", async () => {
      // Mock global fetch for Whisper backend endpoint
      const mockWhisperResponse = {
        transcript: "Transcription from faster whisper model",
        language_code: "hi",
        language: "hi",
        language_probability: 0.98,
        duration_seconds: 4.5,
        processing_time_ms: 320,
        model_used: "Systran/faster-whisper-tiny",
        segments: [
          { id: 0, start: 0.0, end: 4.5, text: "Transcription from faster whisper model" },
        ],
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWhisperResponse,
      } as any);

      try {
        const formData = new FormData();
        const fakeAudio = new Blob(["fake audio stream bytes"], { type: "audio/wav" });
        formData.append("file", fakeAudio, "test.wav");
        formData.append("provider", "whisper");

        const req = new NextRequest("http://localhost:3000/api/transcribe?provider=whisper", {
          method: "POST",
          body: formData,
        });

        const res = await transcribeHandler(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.transcript).toBe("Transcription from faster whisper model");
        expect(data.provider).toBe("whisper");
        expect(data.language_code).toBe("hi");
        expect(data.duration_seconds).toBe(4.5);
        expect(data.segments.length).toBe(1);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("returns 401 when explicit Sarvam provider is requested without API key", async () => {
      const formData = new FormData();
      const fakeAudio = new Blob(["fake audio stream bytes"], { type: "audio/wav" });
      formData.append("file", fakeAudio, "test.wav");
      formData.append("provider", "sarvam");

      const req = new NextRequest("http://localhost:3000/api/transcribe?provider=sarvam", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Sarvam AI API key is not configured");
    });
  });
});

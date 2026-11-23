import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as healthHandler } from "../app/api/health/route";
import { POST as clarifyHandler } from "../app/api/clarify/route";
import { POST as generateBrdHandler } from "../app/api/generate-brd/route";
import { POST as transcribeHandler } from "../app/api/transcribe/route";
import { saveProject, getSavedProjects } from "../lib/storage";

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

    it("returns 413 if audio file exceeds 25MB limit", async () => {
      const formData = new FormData();
      const largeBlob = new Blob([new Uint8Array(25 * 1024 * 1024 + 1024)], { type: "audio/wav" });
      formData.append("file", largeBlob, "huge.wav");

      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const res = await transcribeHandler(req);
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.error).toContain("exceeds maximum size limit of 25MB");
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

    it("routes to Sarvam provider when requested with API key and normalizes response", async () => {
      process.env.SARVAM_API_KEY = "mock_valid_sarvam_key";

      const mockSarvamSTTResponse = {
        transcript: "Hindi spoken trade description for appointment system",
        language_code: "hi-IN",
        request_id: "sarvam_req_999",
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSarvamSTTResponse,
      } as any);

      try {
        const formData = new FormData();
        const fakeAudio = new Blob(["sample audio bytes"], { type: "audio/wav" });
        formData.append("file", fakeAudio, "trade_audio.wav");
        formData.append("provider", "sarvam");

        const req = new NextRequest("http://localhost:3000/api/transcribe?provider=sarvam", {
          method: "POST",
          body: formData,
        });

        const res = await transcribeHandler(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.transcript).toBe("Hindi spoken trade description for appointment system");
        expect(data.language_code).toBe("hi-IN");
        expect(data.provider).toBe("sarvam");
        expect(data.isDemo).toBe(false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("auto mode gracefully falls back to demo mode when Whisper backend is offline", async () => {
      process.env.WHISPER_API_URL = "http://127.0.0.1:8000/api/speech/transcribe";

      const originalFetch = globalThis.fetch;
      // Simulate fetch failing (ECONNREFUSED / network error)
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("fetch failed: ECONNREFUSED"));
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        const formData = new FormData();
        const fakeAudio = new Blob(["sample audio bytes"], { type: "audio/wav" });
        formData.append("file", fakeAudio, "input.wav");

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
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining("Auto-provider: Whisper service unavailable"),
          expect.stringContaining("ECONNREFUSED")
        );
      } finally {
        globalThis.fetch = originalFetch;
        consoleWarnSpy.mockRestore();
      }
    });
  });

  // 5. Complete End-to-End Workflow & Pipeline Test
  describe("End-to-End Audio-to-BRD Pipeline & Persistence", () => {
    it("executes the full workflow: transcribe -> clarify -> generate BRD -> persist & load", async () => {
      // Step A: Transcribe audio (Demo mode)
      const formData = new FormData();
      const fakeAudio = new Blob(["audio stream bytes"], { type: "audio/wav" });
      formData.append("file", fakeAudio, "clinic_record.wav");

      const transcribeReq = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeRes = await transcribeHandler(transcribeReq);
      expect(transcribeRes.status).toBe(200);
      const transcribeData = await transcribeRes.json();
      expect(transcribeData.transcript).toBeTruthy();

      // Step B: Request Clarification Questions
      const clarifyReq = new NextRequest("http://localhost:3000/api/clarify", {
        method: "POST",
        body: JSON.stringify({
          ideaText: transcribeData.transcript,
          languageCode: transcribeData.language_code || "en-IN",
        }),
      });

      const clarifyRes = await clarifyHandler(clarifyReq);
      expect(clarifyRes.status).toBe(200);
      const clarifyData = await clarifyRes.json();
      expect(clarifyData.questions.length).toBeGreaterThanOrEqual(4);

      // Step C: Generate 12-Section BRD
      const userClarifications = clarifyData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        assumptionOrAnswer: q.defaultAssumption,
      }));

      const brdReq = new NextRequest("http://localhost:3000/api/generate-brd", {
        method: "POST",
        body: JSON.stringify({
          ideaText: transcribeData.transcript,
          clarifications: userClarifications,
          languageCode: "en-IN",
        }),
      });

      const brdRes = await generateBrdHandler(brdReq);
      expect(brdRes.status).toBe(200);
      const brdData = await brdRes.json();
      expect(brdData.brd).toBeDefined();
      expect(brdData.brd.functionalRequirements.length).toBeGreaterThanOrEqual(5);
      expect(brdData.brd.nonFunctionalRequirements.length).toBeGreaterThanOrEqual(4);
      expect(brdData.brd.markdownContent).toBeTruthy();

      // Step D: Persist into Browser LocalStorage
      const mockStorageMap = new Map<string, string>();
      const mockLocalStorage = {
        getItem: (k: string) => mockStorageMap.get(k) ?? null,
        setItem: (k: string, v: string) => mockStorageMap.set(k, v),
        removeItem: (k: string) => mockStorageMap.delete(k),
        clear: () => mockStorageMap.clear(),
      };
      (globalThis as any).window = { localStorage: mockLocalStorage };
      (globalThis as any).localStorage = mockLocalStorage;

      const saveResult = saveProject({
        projectName: brdData.brd.metadata.projectName,
        targetLanguage: "en-IN",
        engine: "BhashaBRD",
        isDemo: true,
        ideaText: transcribeData.transcript,
        brd: brdData.brd,
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.project?.id).toBeTruthy();

      // Step E: Verify retrieval from LocalStorage
      const savedProjects = getSavedProjects();
      expect(savedProjects.length).toBe(1);
      expect(savedProjects[0].projectName).toBe(brdData.brd.metadata.projectName);
      expect(savedProjects[0].brd.summary.executiveSummary).toBeTruthy();
    });
  });
});

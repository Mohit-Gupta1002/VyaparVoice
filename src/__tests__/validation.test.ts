import { describe, it, expect } from "vitest";
import { formatBytes, sanitizeFileName } from "../lib/utils";
import { SUPPORTED_LANGUAGES } from "../lib/constants";
import { extractJsonFromText } from "../lib/sarvam";

describe("Validation and Utility Functions", () => {
  it("formats bytes accurately into human readable sizes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(25 * 1024 * 1024)).toBe("25 MB");
  });

  it("sanitizes file names to prevent injection or invalid characters", () => {
    expect(sanitizeFileName("My Clinic App: Version 1.0!*")).toBe("my_clinic_app__version_1_0__");
    expect(sanitizeFileName("Normal-Project_Name")).toBe("normal-project_name");
  });

  it("supports all major Indian languages and Auto-detect", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("hi-IN");
    expect(codes).toContain("en-IN");
    expect(codes).toContain("mr-IN");
    expect(codes).toContain("ta-IN");
    expect(codes).toContain("te-IN");
    expect(codes).toContain("bn-IN");
    expect(codes).toContain("gu-IN");
    expect(codes).toContain("kn-IN");
    expect(codes).toContain("ml-IN");
    expect(codes).toContain("pa-IN");
    expect(codes).toContain("od-IN");
    expect(codes).toContain("unknown");
  });

  it("verifies minimum idea length constraints", () => {
    const isIdeaValid = (text: string) => typeof text === "string" && text.trim().length >= 15;
    expect(isIdeaValid("short")).toBe(false);
    expect(isIdeaValid("              ")).toBe(false);
    expect(isIdeaValid("Clinic app for appointment booking and queue managing")).toBe(true);
  });

  it("extracts JSON accurately from various model output formats", () => {
    // Pure JSON
    expect(extractJsonFromText('{"status":"ok"}')).toEqual({ status: "ok" });

    // Fenced markdown JSON
    expect(extractJsonFromText('```json\n{"questions":[{"id":"Q-1"}]}\n```')).toEqual({
      questions: [{ id: "Q-1" }],
    });

    // Fenced markdown with leading and trailing conversational text
    const conversational = 'Here are the questions:\n```json\n{"key": "value"}\n```\nLet me know if you need more!';
    expect(extractJsonFromText(conversational)).toEqual({ key: "value" });

    // Raw JSON wrapped in commentary without fences
    const unwrapped = 'Certainly! The output is {"projectName": "ClinicApp"} as requested.';
    expect(extractJsonFromText(unwrapped)).toEqual({ projectName: "ClinicApp" });
  });
});

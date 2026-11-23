import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  STORAGE_SCHEMA_VERSION,
  isStorageAvailable,
  getSavedProjects,
  saveProject,
  renameProject,
  deleteProject,
  getProjectById,
  clearAllProjects,
} from "../lib/storage";
import { generateDemoBRD } from "../lib/demo-data";
import { DEFAULT_SAMPLE_IDEA } from "../lib/constants";

// In-memory mock localStorage implementation for Node test environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  public shouldThrowOnSet: boolean = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet && key === STORAGE_KEY) {
      const err = new Error("QuotaExceededError: DOM Exception 22");
      err.name = "QuotaExceededError";
      throw err;
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("LocalStorage Persistence & Project History", () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as any).window = {
      localStorage: mockStorage,
    };
    (globalThis as any).localStorage = mockStorage;
  });

  it("detects localStorage availability correctly", () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it("saves a new project and retrieves it with schema versioning", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const saveResult = saveProject({
      projectName: "Ayurveda Clinic OPD",
      targetLanguage: "hi-IN",
      engine: "BhashaBRD",
      isDemo: true,
      ideaText: "Ayurveda clinic appointment scheduler",
      brd,
    });

    expect(saveResult.success).toBe(true);
    expect(saveResult.project).toBeDefined();
    expect(saveResult.project?.id).toBeTruthy();
    expect(saveResult.project?.schemaVersion).toBe(STORAGE_SCHEMA_VERSION);
    expect(saveResult.project?.projectName).toBe("Ayurveda Clinic OPD");

    const projects = getSavedProjects();
    expect(projects.length).toBe(1);
    expect(projects[0].projectName).toBe("Ayurveda Clinic OPD");
    expect(projects[0].brd.summary.executiveSummary).toBeTruthy();
  });

  it("retrieves a project by ID", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const saved = saveProject({
      projectName: "Kirana Inventory",
      targetLanguage: "en-IN",
      engine: "BhashaBRD",
      isDemo: true,
      brd,
    });

    const projectId = saved.project!.id;
    const retrieved = getProjectById(projectId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.projectName).toBe("Kirana Inventory");
  });

  it("renames an existing project cleanly", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const saved = saveProject({
      projectName: "Original Name",
      targetLanguage: "en-IN",
      engine: "BhashaBRD",
      isDemo: true,
      brd,
    });

    const projectId = saved.project!.id;
    const renameResult = renameProject(projectId, "Updated New Name");
    expect(renameResult).toBe(true);

    const updated = getProjectById(projectId);
    expect(updated?.projectName).toBe("Updated New Name");
    expect(updated?.brd.metadata.projectName).toBe("Updated New Name");
  });

  it("deletes a project cleanly by ID", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const saved = saveProject({
      projectName: "To Delete",
      targetLanguage: "en-IN",
      engine: "BhashaBRD",
      isDemo: true,
      brd,
    });

    const projectId = saved.project!.id;
    expect(getSavedProjects().length).toBe(1);

    const deleteResult = deleteProject(projectId);
    expect(deleteResult).toBe(true);
    expect(getSavedProjects().length).toBe(0);
    expect(getProjectById(projectId)).toBeNull();
  });

  it("handles malformed JSON gracefully without crashing", () => {
    mockStorage.setItem(STORAGE_KEY, "{ not valid json :::");
    const projects = getSavedProjects();
    expect(projects).toEqual([]);
  });

  it("handles storage quota errors gracefully", () => {
    mockStorage.shouldThrowOnSet = true;
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const saveResult = saveProject({
      projectName: "Heavy Project",
      targetLanguage: "en-IN",
      engine: "BhashaBRD",
      isDemo: true,
      brd,
    });

    expect(saveResult.success).toBe(false);
    expect(saveResult.error).toMatch(/quota exceeded/i);
  });
});

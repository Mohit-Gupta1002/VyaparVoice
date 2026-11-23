import { StructuredBRD } from "./types";

export const STORAGE_KEY = "vyaparvoice_saved_projects_v1";
export const STORAGE_SCHEMA_VERSION = 1;

export interface SavedProject {
  id: string;
  schemaVersion: number;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  targetLanguage: string;
  engine: string;
  isDemo: boolean;
  ideaText?: string;
  brd: StructuredBRD;
}

/**
 * Safely checks if browser localStorage is available and writable.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__vyaparvoice_storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieve all saved projects from browser localStorage.
 * Recovers gracefully from malformed or corrupted JSON.
 */
export function getSavedProjects(): SavedProject[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("Malformed storage data in localStorage, resetting to empty array.");
      return [];
    }

    // Filter valid schema version projects
    return parsed.filter(
      (item): item is SavedProject =>
        Boolean(item && typeof item === "object" && item.id && item.projectName && item.brd)
    );
  } catch (err) {
    console.error("Failed to read saved projects from localStorage:", err);
    return [];
  }
}

/**
 * Saves a new project or updates an existing project in browser localStorage.
 */
export function saveProject(
  payload: {
    id?: string;
    projectName: string;
    targetLanguage: string;
    engine: string;
    isDemo: boolean;
    ideaText?: string;
    brd: StructuredBRD;
  }
): { success: boolean; project?: SavedProject; error?: string } {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "Browser localStorage is not available in your environment.",
    };
  }

  try {
    const existingProjects = getSavedProjects();
    const now = new Date().toISOString();
    const projectId = payload.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const existingIndex = existingProjects.findIndex((p) => p.id === projectId);

    const projectToSave: SavedProject = {
      id: projectId,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      projectName: payload.projectName.trim() || payload.brd.metadata.projectName || "Untitled Business Plan",
      createdAt: existingIndex >= 0 ? existingProjects[existingIndex].createdAt : now,
      updatedAt: now,
      targetLanguage: payload.targetLanguage || payload.brd.metadata.targetLanguage || "en-IN",
      engine: payload.engine || payload.brd.metadata.engine || "BhashaBRD",
      isDemo: payload.isDemo ?? payload.brd.metadata.isDemo ?? true,
      ideaText: payload.ideaText,
      brd: {
        ...payload.brd,
        metadata: {
          ...payload.brd.metadata,
          projectName: payload.projectName.trim() || payload.brd.metadata.projectName || "Untitled Business Plan",
        },
      },
    };

    if (existingIndex >= 0) {
      existingProjects[existingIndex] = projectToSave;
    } else {
      existingProjects.unshift(projectToSave); // Place newest at the top
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProjects));

    return { success: true, project: projectToSave };
  } catch (err: any) {
    console.error("Storage error while saving project:", err);
    if (err.name === "QuotaExceededError" || err.code === 22) {
      return {
        success: false,
        error: "Browser storage quota exceeded. Please export and delete older projects to free space.",
      };
    }
    return {
      success: false,
      error: err.message || "Failed to save project to browser storage.",
    };
  }
}

/**
 * Renames an existing project in browser localStorage.
 */
export function renameProject(id: string, newName: string): boolean {
  if (!isStorageAvailable() || !newName.trim()) {
    return false;
  }

  try {
    const projects = getSavedProjects();
    const target = projects.find((p) => p.id === id);
    if (!target) {
      return false;
    }

    target.projectName = newName.trim();
    target.updatedAt = new Date().toISOString();
    target.brd.metadata.projectName = newName.trim();

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error("Error renaming project in localStorage:", err);
    return false;
  }
}

/**
 * Deletes a project from browser localStorage.
 */
export function deleteProject(id: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const projects = getSavedProjects();
    const updated = projects.filter((p) => p.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Error deleting project from localStorage:", err);
    return false;
  }
}

/**
 * Retrieves a single project by ID.
 */
export function getProjectById(id: string): SavedProject | null {
  const projects = getSavedProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Clear all saved projects from browser localStorage.
 */
export function clearAllProjects(): void {
  if (isStorageAvailable()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear projects from localStorage:", err);
    }
  }
}

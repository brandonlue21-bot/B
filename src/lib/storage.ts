import type { AppData, ClassData } from '../types';

const STORAGE_KEY = 'gradebook-data-v1';

interface GradebookAPI {
  loadData: () => Promise<AppData | null>;
  saveData: (data: AppData) => Promise<void>;
  getDataPath: () => Promise<string>;
}

function getElectronBridge(): GradebookAPI | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { gradebookAPI?: GradebookAPI }).gradebookAPI ?? null;
}

export function isDesktopApp(): boolean {
  return getElectronBridge() !== null;
}

/** Where grades are being saved on disk, when running as the desktop app. */
export async function getDataFilePath(): Promise<string | null> {
  const bridge = getElectronBridge();
  return bridge ? bridge.getDataPath() : null;
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyClass(name: string): ClassData {
  return {
    id: makeId(),
    name,
    students: [],
    categories: [],
    assignments: [],
    scores: {},
  };
}

function seedData(): AppData {
  const cls = emptyClass('My Class');
  const tests = { id: makeId(), name: 'Tests', weight: 40 };
  const assignments = { id: makeId(), name: 'Assignments', weight: 35 };
  const homework = { id: makeId(), name: 'Homework', weight: 15 };
  const participation = { id: makeId(), name: 'Participation', weight: 10 };
  cls.categories = [tests, assignments, homework, participation];
  return { classes: [cls], currentClassId: cls.id };
}

export async function loadData(): Promise<AppData> {
  const bridge = getElectronBridge();
  if (bridge) {
    const data = await bridge.loadData();
    if (data && data.classes && data.classes.length > 0) return data;
    return seedData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.classes || parsed.classes.length === 0) return seedData();
    return parsed;
  } catch {
    return seedData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  const bridge = getElectronBridge();
  if (bridge) {
    await bridge.saveData(data);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

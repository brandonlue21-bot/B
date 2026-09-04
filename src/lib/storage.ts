import type { AppData, ClassData } from '../types';
import { clearStoredHandle, getStoredHandle, setStoredHandle } from './fileHandleStore';

const STORAGE_KEY = 'gradebook-data-v1';
const DISMISS_KEY = 'gradebook-file-prompt-dismissed';

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

/** Where grades are being saved on disk, when running as the Electron desktop app. */
export async function getDataFilePath(): Promise<string | null> {
  const bridge = getElectronBridge();
  return bridge ? bridge.getDataPath() : null;
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

export function isFilePromptDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissFilePrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // ignore
  }
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

function parseAppData(raw: string): AppData {
  const parsed = JSON.parse(raw) as AppData;
  if (!parsed.classes || parsed.classes.length === 0) return seedData();
  return parsed;
}

async function readFile(handle: FileSystemFileHandle): Promise<AppData> {
  const file = await handle.getFile();
  const text = await file.text();
  if (!text.trim()) return seedData();
  return parseAppData(text);
}

async function writeFile(handle: FileSystemFileHandle, data: AppData): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export function loadFromBrowserStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    return parseAppData(raw);
  } catch {
    return seedData();
  }
}

export type StorageMode =
  | { kind: 'desktop' }
  | { kind: 'browser' }
  | { kind: 'file'; fileName: string; handle: FileSystemFileHandle }
  | { kind: 'file-needs-permission'; fileName: string; handle: FileSystemFileHandle };

export interface StorageResult {
  mode: StorageMode;
  /** null only for 'file-needs-permission', where the file can't be read until reconnected. */
  data: AppData | null;
}

export async function initStorage(): Promise<StorageResult> {
  const bridge = getElectronBridge();
  if (bridge) {
    const data = await bridge.loadData();
    return { mode: { kind: 'desktop' }, data: data && data.classes?.length ? data : seedData() };
  }

  if (isFileSystemAccessSupported()) {
    const handle = await getStoredHandle().catch(() => undefined);
    if (handle) {
      const permission = await handle.queryPermission?.({ mode: 'readwrite' });
      if (permission === 'granted') {
        try {
          const data = await readFile(handle);
          return { mode: { kind: 'file', fileName: handle.name, handle }, data };
        } catch {
          // File moved/deleted — fall through to asking the user to reconnect or pick a new one.
        }
      }
      return { mode: { kind: 'file-needs-permission', fileName: handle.name, handle }, data: null };
    }
  }

  return { mode: { kind: 'browser' }, data: loadFromBrowserStorage() };
}

export async function reconnectFile(handle: FileSystemFileHandle): Promise<StorageResult> {
  const permission = await handle.requestPermission?.({ mode: 'readwrite' });
  if (permission !== 'granted') {
    return { mode: { kind: 'file-needs-permission', fileName: handle.name, handle }, data: null };
  }
  const data = await readFile(handle);
  return { mode: { kind: 'file', fileName: handle.name, handle }, data };
}

/** Opens the native "Save As" picker so the user can choose or create the file grades live in. */
export async function chooseNewFile(existingData: AppData): Promise<StorageResult | null> {
  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: 'gradebook-data.json',
      types: [{ description: 'Gradebook data', accept: { 'application/json': ['.json'] } }],
    });
    await writeFile(handle, existingData);
    await setStoredHandle(handle);
    return { mode: { kind: 'file', fileName: handle.name, handle }, data: existingData };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}

export async function forgetFile(): Promise<void> {
  await clearStoredHandle().catch(() => {});
}

export async function saveData(mode: StorageMode, data: AppData): Promise<void> {
  if (mode.kind === 'desktop') {
    const bridge = getElectronBridge();
    if (bridge) await bridge.saveData(data);
    return;
  }
  if (mode.kind === 'file') {
    await writeFile(mode.handle, data);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

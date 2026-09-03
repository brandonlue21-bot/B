import type { AppData, ClassData } from '../types';

const STORAGE_KEY = 'gradebook-data-v1';

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

export function loadData(): AppData {
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

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

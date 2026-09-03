import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Assignment, Category, ClassData } from './types';
import { emptyClass, loadData, makeId, saveData } from './lib/storage';

interface Store {
  data: AppData;
  currentClass: ClassData;
  setCurrentClassId: (id: string) => void;
  addClass: (name: string) => void;
  renameClass: (id: string, name: string) => void;
  deleteClass: (id: string) => void;
  addStudent: (name: string) => void;
  renameStudent: (id: string, name: string) => void;
  deleteStudent: (id: string) => void;
  addCategory: (name: string, weight: number) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  addAssignment: (categoryId: string, name: string, maxPoints: number, weight: number) => void;
  updateAssignment: (id: string, patch: Partial<Omit<Assignment, 'id'>>) => void;
  deleteAssignment: (id: string) => void;
  setScore: (studentId: string, assignmentId: string, value: number | undefined) => void;
  replaceCurrentClass: (next: ClassData) => void;
}

const StoreContext = createContext<Store | null>(null);

function updateClass(data: AppData, classId: string, fn: (c: ClassData) => ClassData): AppData {
  return { ...data, classes: data.classes.map((c) => (c.id === classId ? fn(c) : c)) };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const currentClass = useMemo(
    () => data.classes.find((c) => c.id === data.currentClassId) ?? data.classes[0],
    [data],
  );

  const setCurrentClassId = useCallback((id: string) => {
    setData((d) => ({ ...d, currentClassId: id }));
  }, []);

  const addClass = useCallback((name: string) => {
    setData((d) => {
      const cls = emptyClass(name);
      return { classes: [...d.classes, cls], currentClassId: cls.id };
    });
  }, []);

  const renameClass = useCallback((id: string, name: string) => {
    setData((d) => updateClass(d, id, (c) => ({ ...c, name })));
  }, []);

  const deleteClass = useCallback((id: string) => {
    setData((d) => {
      const classes = d.classes.filter((c) => c.id !== id);
      const finalClasses = classes.length > 0 ? classes : [emptyClass('My Class')];
      const currentClassId =
        d.currentClassId === id ? finalClasses[0].id : d.currentClassId ?? finalClasses[0].id;
      return { classes: finalClasses, currentClassId };
    });
  }, []);

  const currentId = currentClass?.id;

  const addStudent = useCallback(
    (name: string) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          students: [...c.students, { id: makeId(), name }],
        })),
      );
    },
    [currentId],
  );

  const renameStudent = useCallback(
    (id: string, name: string) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          students: c.students.map((s) => (s.id === id ? { ...s, name } : s)),
        })),
      );
    },
    [currentId],
  );

  const deleteStudent = useCallback(
    (id: string) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => {
          const scores = { ...c.scores };
          delete scores[id];
          return { ...c, students: c.students.filter((s) => s.id !== id), scores };
        }),
      );
    },
    [currentId],
  );

  const addCategory = useCallback(
    (name: string, weight: number) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          categories: [...c.categories, { id: makeId(), name, weight }],
        })),
      );
    },
    [currentId],
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<Omit<Category, 'id'>>) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          categories: c.categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)),
        })),
      );
    },
    [currentId],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => {
          const assignmentIds = new Set(
            c.assignments.filter((a) => a.categoryId === id).map((a) => a.id),
          );
          const scores: typeof c.scores = {};
          for (const [studentId, studentScores] of Object.entries(c.scores)) {
            const filtered = Object.fromEntries(
              Object.entries(studentScores).filter(([aid]) => !assignmentIds.has(aid)),
            );
            scores[studentId] = filtered;
          }
          return {
            ...c,
            categories: c.categories.filter((cat) => cat.id !== id),
            assignments: c.assignments.filter((a) => a.categoryId !== id),
            scores,
          };
        }),
      );
    },
    [currentId],
  );

  const addAssignment = useCallback(
    (categoryId: string, name: string, maxPoints: number, weight: number) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          assignments: [...c.assignments, { id: makeId(), categoryId, name, maxPoints, weight }],
        })),
      );
    },
    [currentId],
  );

  const updateAssignment = useCallback(
    (id: string, patch: Partial<Omit<Assignment, 'id'>>) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => ({
          ...c,
          assignments: c.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      );
    },
    [currentId],
  );

  const deleteAssignment = useCallback(
    (id: string) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => {
          const scores: typeof c.scores = {};
          for (const [studentId, studentScores] of Object.entries(c.scores)) {
            const { [id]: _removed, ...rest } = studentScores;
            scores[studentId] = rest;
          }
          return { ...c, assignments: c.assignments.filter((a) => a.id !== id), scores };
        }),
      );
    },
    [currentId],
  );

  const setScore = useCallback(
    (studentId: string, assignmentId: string, value: number | undefined) => {
      if (!currentId) return;
      setData((d) =>
        updateClass(d, currentId, (c) => {
          const studentScores = { ...(c.scores[studentId] ?? {}) };
          if (value === undefined) {
            delete studentScores[assignmentId];
          } else {
            studentScores[assignmentId] = value;
          }
          return { ...c, scores: { ...c.scores, [studentId]: studentScores } };
        }),
      );
    },
    [currentId],
  );

  const replaceCurrentClass = useCallback(
    (next: ClassData) => {
      if (!currentId) return;
      setData((d) => updateClass(d, currentId, () => next));
    },
    [currentId],
  );

  const store: Store = {
    data,
    currentClass,
    setCurrentClassId,
    addClass,
    renameClass,
    deleteClass,
    addStudent,
    renameStudent,
    deleteStudent,
    addCategory,
    updateCategory,
    deleteCategory,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    setScore,
    replaceCurrentClass,
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

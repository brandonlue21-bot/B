export interface Student {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  /** Percentage weight of this category toward the final grade, e.g. 40 for 40%. */
  weight: number;
}

export interface Assignment {
  id: string;
  categoryId: string;
  name: string;
  maxPoints: number;
  /** Relative weight of this assignment within its category (e.g. a final test = 2, a quiz = 1). */
  weight: number;
}

/** scores[studentId][assignmentId] = points earned. Absent entry = not yet graded. */
export type ScoreMap = Record<string, Record<string, number>>;

export interface ClassData {
  id: string;
  name: string;
  students: Student[];
  categories: Category[];
  assignments: Assignment[];
  scores: ScoreMap;
}

export interface AppData {
  classes: ClassData[];
  currentClassId: string | null;
}

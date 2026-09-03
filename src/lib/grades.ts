import type { Assignment, Category, ClassData, Student } from '../types';

export interface CategoryResult {
  category: Category;
  /** Percentage 0-100, or null if the student has no graded assignments in this category. */
  percent: number | null;
  gradedCount: number;
  totalCount: number;
}

export interface StudentResult {
  student: Student;
  categories: CategoryResult[];
  /** Final weighted percentage 0-100, or null if nothing is graded at all. */
  finalPercent: number | null;
}

/**
 * Category and final percentages are computed only from graded assignments/categories,
 * with weights renormalized over what's actually graded. This keeps a running average
 * meaningful before a gradebook is fully filled in, instead of penalizing ungraded work.
 */
export function computeCategoryResult(
  category: Category,
  categoryAssignments: Assignment[],
  studentScores: Record<string, number>,
): CategoryResult {
  let weightedSum = 0;
  let weightTotal = 0;
  let gradedCount = 0;

  for (const assignment of categoryAssignments) {
    const score = studentScores[assignment.id];
    if (score === undefined || score === null || assignment.maxPoints <= 0) continue;
    gradedCount++;
    const pct = clampPercent((score / assignment.maxPoints) * 100);
    weightedSum += pct * assignment.weight;
    weightTotal += assignment.weight;
  }

  return {
    category,
    percent: weightTotal > 0 ? weightedSum / weightTotal : null,
    gradedCount,
    totalCount: categoryAssignments.length,
  };
}

export function computeStudentResult(
  student: Student,
  categories: Category[],
  assignments: Assignment[],
  scores: Record<string, number>,
): StudentResult {
  const results = categories.map((category) =>
    computeCategoryResult(
      category,
      assignments.filter((a) => a.categoryId === category.id),
      scores,
    ),
  );

  let weightedSum = 0;
  let weightTotal = 0;
  for (const result of results) {
    if (result.percent === null) continue;
    weightedSum += result.percent * result.category.weight;
    weightTotal += result.category.weight;
  }

  return {
    student,
    categories: results,
    finalPercent: weightTotal > 0 ? weightedSum / weightTotal : null,
  };
}

export function computeClassResults(classData: ClassData): StudentResult[] {
  return classData.students.map((student) =>
    computeStudentResult(
      student,
      classData.categories,
      classData.assignments,
      classData.scores[student.id] ?? {},
    ),
  );
}

export function categoryWeightTotal(categories: Category[]): number {
  return categories.reduce((sum, c) => sum + (Number.isFinite(c.weight) ? c.weight : 0), 0);
}

export function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, n));
}

const ONTARIO_SCALE: { min: number; label: string }[] = [
  { min: 90, label: 'A+' },
  { min: 80, label: 'A' },
  { min: 77, label: 'B+' },
  { min: 73, label: 'B' },
  { min: 70, label: 'B-' },
  { min: 67, label: 'C+' },
  { min: 63, label: 'C' },
  { min: 60, label: 'C-' },
  { min: 57, label: 'D+' },
  { min: 53, label: 'D' },
  { min: 50, label: 'D-' },
  { min: 0, label: 'R' },
];

export function toLetterGrade(percent: number | null): string {
  if (percent === null) return '—';
  return ONTARIO_SCALE.find((band) => percent >= band.min)?.label ?? 'R';
}

export function formatPercent(percent: number | null, digits = 1): string {
  return percent === null ? '—' : `${percent.toFixed(digits)}%`;
}

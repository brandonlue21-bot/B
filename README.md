# Gradebook

A weighted-grade marking tool for teachers. Set up categories (e.g. Tests,
Homework, Participation) with a percentage weight each, add assignments to
those categories with their own point value and weight, enter scores, and
each student's final grade is calculated automatically.

## Features

- **Multiple classes** — switch between class sections, each with its own
  roster, categories, assignments, and grades.
- **Weighted categories** — assign each category a percentage of the final
  grade (e.g. Tests 40%, Homework 15%). A banner warns if weights don't add
  up to 100%.
- **Weighted assignments** — within a category, give individual assignments
  a relative weight so, for example, a unit test counts more than a
  homework check.
- **Live gradebook** — a spreadsheet-style grid to enter scores, with each
  student's running final percentage updating instantly. Ungraded work is
  excluded from the average (weights are renormalized over what's graded),
  so the running grade stays meaningful before everything is marked.
- **Reports** — a sortable summary of final grades and letter grades (Ontario
  scale), with a per-student breakdown by category, CSV export for report
  cards, and JSON export/import for backups.
- **Autosaves** to the browser's local storage — no account or server
  needed.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint      # run oxlint
```

## Data model

Each class stores students, categories (with a `weight` percentage),
assignments (each tied to a category, with a `maxPoints` value and a
`weight` relative to other assignments in the same category), and scores
keyed by student and assignment. Grade calculations live in
`src/lib/grades.ts`.

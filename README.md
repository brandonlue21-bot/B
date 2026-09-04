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
- **Autosaves** — as a desktop app, to a JSON file in your user data folder;
  as a web page, to the browser's local storage. No account or server
  needed either way.

## Desktop app (Windows)

This app can run as a standalone Windows program via Electron, saving grades
to a file on your computer instead of the browser.

```bash
npm install
npm run electron:build   # builds dist/ then packages release/Gradebook-<version>-win.zip
```

Unzip `release/Gradebook-<version>-win.zip` anywhere and run `Gradebook.exe`.
Since the app isn't code-signed, Windows SmartScreen will show an "unknown
publisher" warning the first time — click **More info → Run anyway**.

Grades are saved automatically to `gradebook-data.json` in your Windows user
data folder (shown in the app's footer) as you type — no manual save needed.
Use **Export backup** on the Reports tab any time you want a separate copy
(e.g. to move to another computer or attach to an email).

To try the desktop app without building an installer, run
`npm run electron:dev` in one terminal alongside `npm run dev` in another.

## Development

```bash
npm install
npm run dev      # start the dev server (web version)
npm run build    # type-check and build for production
npm run lint      # run oxlint
```

## Data model

Each class stores students, categories (with a `weight` percentage),
assignments (each tied to a category, with a `maxPoints` value and a
`weight` relative to other assignments in the same category), and scores
keyed by student and assignment. Grade calculations live in
`src/lib/grades.ts`.

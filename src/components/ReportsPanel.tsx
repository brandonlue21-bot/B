import { Fragment, useRef, useState } from 'react';
import { useStore } from '../store';
import { computeClassResults, formatPercent, toLetterGrade } from '../lib/grades';
import type { AppData } from '../types';

export function ReportsPanel() {
  const { data, currentClass, replaceCurrentClass } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const results = computeClassResults(currentClass).sort((a, b) =>
    a.student.name.localeCompare(b.student.name),
  );

  function exportCsv() {
    const header = ['Student', ...currentClass.categories.map((c) => `${c.name} (%)`), 'Final (%)', 'Letter'];
    const rows = results.map((r) => [
      r.student.name,
      ...r.categories.map((c) => (c.percent === null ? '' : c.percent.toFixed(1))),
      r.finalPercent === null ? '' : r.finalPercent.toFixed(1),
      toLetterGrade(r.finalPercent),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    downloadFile(csv, `${currentClass.name.replace(/\s+/g, '_')}_grades.csv`, 'text/csv');
  }

  function exportJson() {
    downloadFile(
      JSON.stringify(data satisfies AppData, null, 2),
      'gradebook_backup.json',
      'application/json',
    );
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && parsed.students && parsed.categories && parsed.assignments) {
          if (confirm('Replace the current class data with this file?')) {
            replaceCurrentClass(parsed);
          }
        } else {
          alert('That file does not look like a class backup.');
        }
      } catch {
        alert('Could not read that file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Reports</h2>
          <p className="text-sm text-slate-500">Final weighted grades for {currentClass.name}.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export CSV
          </button>
          <button
            onClick={exportJson}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export backup
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Import class
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJson(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2 font-medium">Student</th>
              <th className="px-4 py-2 font-medium">Final grade</th>
              <th className="px-4 py-2 font-medium">Letter</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No students yet.
                </td>
              </tr>
            )}
            {results.map((r) => (
              <Fragment key={r.student.id}>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-700">{r.student.name}</td>
                  <td className="px-4 py-2 font-semibold text-slate-800">
                    {formatPercent(r.finalPercent)}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{toLetterGrade(r.finalPercent)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() =>
                        setExpanded(expanded === r.student.id ? null : r.student.id)
                      }
                      className="text-sm text-slate-500 underline hover:text-slate-700"
                    >
                      {expanded === r.student.id ? 'hide breakdown' : 'breakdown'}
                    </button>
                  </td>
                </tr>
                {expanded === r.student.id && (
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <td colSpan={4} className="px-4 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                            <th className="py-1 font-medium">Category</th>
                            <th className="py-1 font-medium">Weight</th>
                            <th className="py-1 font-medium">Graded</th>
                            <th className="py-1 font-medium">Category avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.categories.map((c) => (
                            <tr key={c.category.id}>
                              <td className="py-1">{c.category.name}</td>
                              <td className="py-1">{c.category.weight}%</td>
                              <td className="py-1">
                                {c.gradedCount}/{c.totalCount}
                              </td>
                              <td className="py-1 font-medium">{formatPercent(c.percent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

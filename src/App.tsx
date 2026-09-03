import { useState } from 'react';
import { useStore } from './store';
import { ClassSwitcher } from './components/ClassSwitcher';
import { StudentsPanel } from './components/StudentsPanel';
import { CategoriesPanel } from './components/CategoriesPanel';
import { AssignmentsPanel } from './components/AssignmentsPanel';
import { GradebookPanel } from './components/GradebookPanel';
import { ReportsPanel } from './components/ReportsPanel';

const TABS = [
  { key: 'gradebook', label: 'Gradebook' },
  { key: 'categories', label: 'Categories' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'students', label: 'Students' },
  { key: 'reports', label: 'Reports' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function App() {
  const { currentClass } = useStore();
  const [tab, setTab] = useState<TabKey>('gradebook');

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">📊 Gradebook</h1>
          <ClassSwitcher />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {!currentClass ? (
          <p className="text-center text-slate-500">Loading…</p>
        ) : (
          <>
            {tab === 'gradebook' && <GradebookPanel />}
            {tab === 'categories' && <CategoriesPanel />}
            {tab === 'assignments' && <AssignmentsPanel />}
            {tab === 'students' && <StudentsPanel />}
            {tab === 'reports' && <ReportsPanel />}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-slate-400">
        Grades are saved automatically in this browser. Use "Export backup" on the Reports tab to
        save a copy.
      </footer>
    </div>
  );
}

export default App;

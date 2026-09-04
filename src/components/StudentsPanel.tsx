import { useState } from 'react';
import { useStore } from '../store';

export function StudentsPanel() {
  const { currentClass, addStudent, renameStudent, deleteStudent } = useStore();
  const [name, setName] = useState('');
  const [bulk, setBulk] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  if (!currentClass) return null;

  const sorted = [...currentClass.students].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Students</h2>
        <p className="mb-4 text-sm text-slate-500">
          {currentClass.students.length} student{currentClass.students.length === 1 ? '' : 's'} in
          this class.
        </p>

        <div className="divide-y divide-slate-100">
          {sorted.length === 0 && (
            <p className="py-4 text-sm text-slate-400">No students yet. Add some below.</p>
          )}
          {sorted.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2">
              <input
                value={s.name}
                onChange={(e) => renameStudent(s.id, e.target.value)}
                className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <button
                onClick={() => {
                  if (confirm(`Remove ${s.name} and all their grades?`)) deleteStudent(s.id);
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                delete
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addStudent(name.trim());
            setName('');
          }}
          className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4"
        >
          <input
            placeholder="Student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add
          </button>
        </form>

        <button
          onClick={() => setShowBulk((v) => !v)}
          className="mt-3 text-sm text-slate-500 underline hover:text-slate-700"
        >
          {showBulk ? 'Hide' : 'Paste a class list'}
        </button>
        {showBulk && (
          <div className="mt-2 space-y-2">
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={'One name per line\nJane Smith\nJohn Doe'}
              rows={5}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              onClick={() => {
                const names = bulk
                  .split('\n')
                  .map((n) => n.trim())
                  .filter(Boolean);
                names.forEach((n) => addStudent(n));
                setBulk('');
                setShowBulk(false);
              }}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

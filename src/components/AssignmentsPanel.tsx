import { useState } from 'react';
import { useStore } from '../store';

export function AssignmentsPanel() {
  const { currentClass, addAssignment, updateAssignment, deleteAssignment } = useStore();

  if (!currentClass) return null;

  if (currentClass.categories.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-600">
          Add at least one category first (e.g. Tests, Homework) before adding assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Assignments</h2>
        <p className="mb-4 text-sm text-slate-500">
          Each assignment belongs to a category and is worth a number of points. The "weight"
          controls how much it counts relative to other assignments in the same category — give a
          unit test a higher weight than a homework check so it counts for more.
        </p>
      </div>

      {currentClass.categories.map((cat) => (
        <CategoryGroup
          key={cat.id}
          categoryId={cat.id}
          categoryName={cat.name}
          assignments={currentClass.assignments.filter((a) => a.categoryId === cat.id)}
          onAdd={addAssignment}
          onUpdate={updateAssignment}
          onDelete={deleteAssignment}
        />
      ))}
    </div>
  );
}

function CategoryGroup({
  categoryId,
  categoryName,
  assignments,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categoryId: string;
  categoryName: string;
  assignments: { id: string; name: string; maxPoints: number; weight: number }[];
  onAdd: (categoryId: string, name: string, maxPoints: number, weight: number) => void;
  onUpdate: (id: string, patch: Partial<{ name: string; maxPoints: number; weight: number }>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [weight, setWeight] = useState('1');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-800">{categoryName}</h3>

      {assignments.length > 0 && (
        <div className="mb-3 grid grid-cols-[1fr_5rem_5rem_3.5rem] items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          <span>Name</span>
          <span className="text-right">Max pts</span>
          <span className="text-right">Weight</span>
          <span />
        </div>
      )}

      <div className="space-y-2">
        {assignments.map((a) => (
          <div key={a.id} className="grid grid-cols-[1fr_5rem_5rem_3.5rem] items-center gap-2">
            <input
              value={a.name}
              onChange={(e) => onUpdate(a.id, { name: e.target.value })}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              value={a.maxPoints}
              onChange={(e) => onUpdate(a.id, { maxPoints: Number(e.target.value) || 0 })}
              className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-right text-sm"
            />
            <input
              type="number"
              min={0}
              step={0.5}
              value={a.weight}
              onChange={(e) => onUpdate(a.id, { weight: Number(e.target.value) || 0 })}
              className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-right text-sm"
            />
            <button
              onClick={() => {
                if (confirm(`Delete "${a.name}"?`)) onDelete(a.id);
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
          onAdd(categoryId, name.trim(), Number(maxPoints) || 0, Number(weight) || 1);
          setName('');
          setMaxPoints('100');
          setWeight('1');
        }}
        className="mt-3 grid grid-cols-[1fr_5rem_5rem_3.5rem] items-center gap-2 border-t border-slate-100 pt-3"
      >
        <input
          placeholder="New assignment name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          min={0}
          value={maxPoints}
          onChange={(e) => setMaxPoints(e.target.value)}
          className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm"
        />
        <input
          type="number"
          min={0}
          step={0.5}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-800 px-2 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add
        </button>
      </form>
    </div>
  );
}

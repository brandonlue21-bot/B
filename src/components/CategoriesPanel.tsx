import { useState } from 'react';
import { useStore } from '../store';
import { categoryWeightTotal } from '../lib/grades';

export function CategoriesPanel() {
  const { currentClass, addCategory, updateCategory, deleteCategory } = useStore();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');

  if (!currentClass) return null;

  const total = categoryWeightTotal(currentClass.categories);
  const totalOk = Math.abs(total - 100) < 0.01;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Categories</h2>
        <p className="mb-4 text-sm text-slate-500">
          Categories group assignments (e.g. Tests, Homework) and each carries a percentage
          weight toward the final grade. Weights should add up to 100%.
        </p>

        <div
          className={`mb-4 rounded-md px-3 py-2 text-sm font-medium ${
            totalOk
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          Total weight: {total}% {totalOk ? '✓' : '— should be 100%'}
        </div>

        <div className="divide-y divide-slate-100">
          {currentClass.categories.length === 0 && (
            <p className="py-4 text-sm text-slate-400">No categories yet. Add one below.</p>
          )}
          {currentClass.categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 py-2">
              <input
                value={cat.name}
                onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={cat.weight}
                  onChange={(e) =>
                    updateCategory(cat.id, { weight: Number(e.target.value) || 0 })
                  }
                  className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-right"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete category "${cat.name}" and all its assignments?`)) {
                    deleteCategory(cat.id);
                  }
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
            addCategory(name.trim(), Number(weight) || 0);
            setName('');
            setWeight('');
          }}
          className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4"
        >
          <input
            placeholder="Category name (e.g. Tests)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Weight"
            min={0}
            max={100}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-right"
          />
          <span className="text-sm text-slate-500">%</span>
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

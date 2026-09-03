import { useState } from 'react';
import { useStore } from '../store';

export function ClassSwitcher() {
  const { data, currentClass, setCurrentClassId, addClass, renameClass, deleteClass } =
    useStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentClass?.name ?? '');

  if (!currentClass) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={currentClass.id}
        onChange={(e) => setCurrentClassId(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700"
      >
        {data.classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {editingName ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameDraft.trim()) renameClass(currentClass.id, nameDraft.trim());
            setEditingName(false);
          }}
          className="flex items-center gap-1"
        >
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => setEditingName(false)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </form>
      ) : (
        <button
          onClick={() => {
            setNameDraft(currentClass.name);
            setEditingName(true);
          }}
          className="text-sm text-slate-500 hover:text-slate-700"
          title="Rename class"
        >
          ✏️ rename
        </button>
      )}

      {data.classes.length > 1 && (
        <button
          onClick={() => {
            if (confirm(`Delete class "${currentClass.name}"? This cannot be undone.`)) {
              deleteClass(currentClass.id);
            }
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          delete class
        </button>
      )}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) addClass(newName.trim());
            setNewName('');
            setAdding(false);
          }}
          className="flex items-center gap-1"
        >
          <input
            autoFocus
            placeholder="Class name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => setAdding(false)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
        >
          + new class
        </button>
      )}
    </div>
  );
}

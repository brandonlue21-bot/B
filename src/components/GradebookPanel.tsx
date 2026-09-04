import { useStore } from '../store';
import { computeStudentResult, formatPercent } from '../lib/grades';

export function GradebookPanel() {
  const { currentClass, setScore } = useStore();

  if (!currentClass) return null;

  const { students, categories, assignments, scores } = currentClass;

  if (students.length === 0 || assignments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-600">
          {students.length === 0
            ? 'Add students first, then come back to enter grades.'
            : 'Add categories and assignments first, then come back to enter grades.'}
        </p>
      </div>
    );
  }

  const orderedAssignments = categories.flatMap((cat) =>
    assignments.filter((a) => a.categoryId === cat.id),
  );
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 min-w-[10rem] border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left"></th>
              {categories.map((cat) => {
                const count = assignments.filter((a) => a.categoryId === cat.id).length;
                if (count === 0) return null;
                return (
                  <th
                    key={cat.id}
                    colSpan={count}
                    className="sticky top-0 z-10 border-b border-l border-slate-200 bg-slate-100 px-2 py-1.5 text-center font-medium text-slate-600"
                  >
                    {cat.name} <span className="text-slate-400">({cat.weight}%)</span>
                  </th>
                );
              })}
              <th className="sticky top-0 z-10 border-b border-l border-slate-200 bg-slate-100 px-3 py-1.5 text-center font-semibold text-slate-700">
                Final
              </th>
            </tr>
            <tr>
              <th className="sticky left-0 top-8 z-20 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">
                Student
              </th>
              {orderedAssignments.map((a) => (
                <th
                  key={a.id}
                  className="sticky top-8 z-10 min-w-[5.5rem] border-b border-l border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-normal text-slate-500"
                  title={`Weight ${a.weight} within category`}
                >
                  {a.name}
                  <div className="text-xs text-slate-400">/{a.maxPoints}</div>
                </th>
              ))}
              <th className="sticky top-8 z-10 border-b border-l border-slate-200 bg-slate-50 px-3 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => {
              const studentScores = scores[student.id] ?? {};
              const result = computeStudentResult(
                student,
                categories,
                assignments,
                studentScores,
              );
              return (
                <tr key={student.id} className="odd:bg-white even:bg-slate-50/50">
                  <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-1.5 font-medium text-slate-700">
                    {student.name}
                  </td>
                  {orderedAssignments.map((a) => {
                    const value = studentScores[a.id];
                    return (
                      <td key={a.id} className="border-b border-l border-slate-200 p-0.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={a.maxPoints}
                          value={value ?? ''}
                          placeholder="—"
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              setScore(student.id, a.id, undefined);
                              return;
                            }
                            const num = Number(raw);
                            if (Number.isNaN(num)) return;
                            const clamped = Math.max(0, Math.min(a.maxPoints, num));
                            setScore(student.id, a.id, clamped);
                          }}
                          className="w-16 rounded border border-transparent bg-transparent px-1.5 py-1 text-center hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                      </td>
                    );
                  })}
                  <td className="border-b border-l border-slate-200 px-3 py-1.5 text-center font-semibold text-slate-800">
                    {formatPercent(result.finalPercent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";

const STORAGE_KEY = "expenseTrackerSavingGoals";

export default function SavingGoals() {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  function saveGoals(updatedGoals) {
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
  }

  function addGoal(event) {
    event.preventDefault();

    if (!name.trim() || Number(target) <= 0) return;

    saveGoals([
      ...goals,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        target: Number(target),
        saved: 0,
      },
    ]);

    setName("");
    setTarget("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <Target size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Saving Goals
            </h1>
            <p className="mt-1 text-slate-500">
              Plan your savings and track your progress.
            </p>
          </div>
        </div>

        <form
          onSubmit={addGoal}
          className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Goal name (e.g. New laptop)"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <input
            type="number"
            min="1"
            step="0.01"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Target amount (₹)"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            Add Goal
          </button>
        </form>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Target className="mx-auto mb-3 text-slate-400" size={38} />
            <h2 className="font-semibold text-slate-800">
              No savings goals yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add your first goal using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = Math.min(
                100,
                (goal.saved / goal.target) * 100
              );

              return (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {goal.name}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        saveGoals(goals.filter((item) => item.id !== goal.id))
                      }
                      aria-label={`Delete ${goal.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">Target amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{goal.target.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-blue-700">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    ₹{goal.saved.toLocaleString("en-IN")} saved
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const amount = Number(
                        window.prompt("Enter the amount saved (₹)", "0")
                      );

                      if (!Number.isFinite(amount) || amount <= 0) return;

                      saveGoals(
                        goals.map((item) =>
                          item.id === goal.id
                            ? { ...item, saved: item.saved + amount }
                            : item
                        )
                      );
                    }}
                    className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Add Savings
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

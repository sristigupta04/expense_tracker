
import { useState } from "react";
import { Target, Plus, Trash2, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "expenseTrackerSavingGoals";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function SavingGoals() {
  const [goals, setGoals] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  function saveGoals(updatedGoals) {
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
  }

  function addGoal(event) {
    event.preventDefault();
    setError("");

    const targetAmount = Number(target);

    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    const newGoal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      target: targetAmount,
      saved: 0,
      createdAt: new Date().toISOString(),
    };

    saveGoals([...goals, newGoal]);
    setName("");
    setTarget("");
  }

  function addSavings(goal) {
    const input = window.prompt(
      `How much did you save for "${goal.name}"?`,
      ""
    );

    if (input === null || input.trim() === "") return;

    const amount = Number(input);

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Please enter a valid amount greater than zero.");
      return;
    }

    saveGoals(
      goals.map((item) =>
        item.id === goal.id
          ? { ...item, saved: Number(item.saved || 0) + amount }
          : item
      )
    );
  }

  function deleteGoal(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saving goal?"
    );

    if (!confirmed) return;

    saveGoals(goals.filter((goal) => goal.id !== id));
  }

  const totalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.target || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.saved || 0),
    0
  );

  const completedGoals = goals.filter(
    (goal) => Number(goal.saved) >= Number(goal.target)
  ).length;

  const overallProgress =
    totalTarget > 0
      ? Math.min(100, (totalSaved / totalTarget) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
              <Target size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Saving Goals
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Set targets, save consistently, and achieve your goals.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Savings
              </p>
              <Wallet className="text-blue-700" size={21} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalSaved)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Target
              </p>
              <Target className="text-indigo-700" size={21} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalTarget)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Completed Goals
              </p>
              <CheckCircle2 className="text-emerald-600" size={21} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {completedGoals}
              <span className="ml-2 text-sm font-medium text-slate-400">
                / {goals.length}
              </span>
            </h2>
          </div>
        </div>

        {/* Overall Progress */}
        {goals.length > 0 && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Overall Savings Progress
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)}
                </p>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {Math.round(overallProgress)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-700 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </section>
        )}

        {/* Add Goal Form */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Create a Saving Goal
              </h2>
              <p className="text-sm text-slate-500">
                What are you saving money for?
              </p>
            </div>
          </div>

          <form onSubmit={addGoal}>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Goal name (e.g. New Laptop)"
                maxLength={60}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="Target amount (₹)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                <Plus size={18} />
                Add Goal
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Goals List */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Your Goals
          </h2>
          <span className="text-sm text-slate-500">
            {goals.length} {goals.length === 1 ? "goal" : "goals"}
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Target size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No savings goals yet
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Create your first savings goal and start tracking your financial progress.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {goals.map((goal) => {
              const saved = Number(goal.saved) || 0;
              const targetAmount = Number(goal.target) || 0;
              const progress =
                targetAmount > 0
                  ? Math.min(100, (saved / targetAmount) * 100)
                  : 0;

              const isCompleted = saved >= targetAmount;

              return (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                        <Target size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {goal.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Saving goal
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      aria-label={`Delete ${goal.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Saved Amount</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(saved)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Target Amount</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      Progress
                    </span>
                    <span className="font-bold text-blue-700">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-blue-700"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <CheckCircle2 size={16} />
                        Goal completed!
                      </span>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {formatCurrency(targetAmount - saved)} remaining
                      </p>
                    )}

                    <span className="text-xs text-slate-400">
                      {formatCurrency(saved)} saved
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addSavings(goal)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                  >
                    <TrendingUp size={17} />
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

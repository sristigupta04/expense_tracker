
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Wallet,
  RefreshCw,
  ArrowLeftRight,
  ReceiptText,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import {
  getSharedGroups,
  createSharedGroup,
  getGroupExpenses,
  getGroupBalances,
  createSharedExpense,
  createSettlement,
} from "../services/sharedExpenseApi";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const initialExpense = {
  title: "",
  totalAmount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  paidBy: "",
  splitType: "equal",
  note: "",
};

export default function SharedExpenses() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    memberEmails: "",
  });

  const [expenseForm, setExpenseForm] = useState(initialExpense);
  const [splitValues, setSplitValues] = useState({});
  const [settlementForm, setSettlementForm] = useState({
    to: "",
    amount: "",
    note: "",
  });

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const members = selectedGroup?.members || [];

  const loadGroups = async (preferredId = "") => {
    setLoading(true);
    setError("");

    try {
      const result = await getSharedGroups();
      setGroups(result);

      const nextId =
        preferredId ||
        (result.some((group) => group._id === selectedGroupId)
          ? selectedGroupId
          : result[0]?._id || "");

      setSelectedGroupId(nextId);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load groups.");
    } finally {
      setLoading(false);
    }
  };

  const loadGroupData = async (groupId) => {
    if (!groupId) {
      setExpenses([]);
      setBalances([]);
      return;
    }

    setError("");

    try {
      const [expenseData, balanceData] = await Promise.all([
        getGroupExpenses(groupId),
        getGroupBalances(groupId),
      ]);

      setExpenses(expenseData);
      setBalances(balanceData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load group details."
      );
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadGroupData(selectedGroupId);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!members.length) return;

    setExpenseForm((current) => ({
      ...current,
      paidBy: members.some((member) => member._id === current.paidBy)
        ? current.paidBy
        : members[0]._id,
    }));

    setSplitValues((current) => {
      const next = { ...current };

      members.forEach((member) => {
        if (!next[member._id]) {
          next[member._id] = { amount: "", percentage: "" };
        }
      });

      return next;
    });

    setSettlementForm((current) => ({
      ...current,
      to: members.find((member) => member._id !== selectedGroup?.createdBy?._id)
        ? members.find(
            (member) => member._id !== selectedGroup?.createdBy?._id
          )._id
        : "",
    }));
  }, [selectedGroupId, members.length]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const memberEmails = groupForm.memberEmails
        .split(/[\n,;]+/)
        .map((email) => email.trim())
        .filter(Boolean);

      const group = await createSharedGroup({
        name: groupForm.name,
        description: groupForm.description,
        memberEmails,
      });

      setGroupForm({ name: "", description: "", memberEmails: "" });
      setShowGroupForm(false);
      setSuccess("Group created successfully.");
      await loadGroups(group._id);
    } catch (err) {
      const missing = err.response?.data?.missingEmails;
      setError(
        missing?.length
          ? `Register these emails first: ${missing.join(", ")}`
          : err.response?.data?.message || "Could not create group."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExpense = async (event) => {
    event.preventDefault();

    if (!selectedGroup) return;

    const total = Number(expenseForm.totalAmount);

    if (!Number.isFinite(total) || total <= 0) {
      setError("Enter a valid total amount.");
      return;
    }

    let splits = [];

    if (expenseForm.splitType !== "equal") {
      splits = members.map((member) => ({
        user: member._id,
        ...(expenseForm.splitType === "custom"
          ? { amount: Number(splitValues[member._id]?.amount || 0) }
          : {
              percentage: Number(
                splitValues[member._id]?.percentage || 0
              ),
            }),
      }));
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createSharedExpense({
        groupId: selectedGroup._id,
        title: expenseForm.title,
        totalAmount: total,
        paidBy: expenseForm.paidBy,
        category: expenseForm.category,
        date: expenseForm.date,
        splitType: expenseForm.splitType,
        splits,
        note: expenseForm.note,
      });

      setExpenseForm(initialExpense);
      setShowExpenseForm(false);
      setSuccess("Shared expense added.");
      await loadGroups(selectedGroup._id);
      await loadGroupData(selectedGroup._id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save shared expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSettlement = async (event) => {
    event.preventDefault();

    if (!selectedGroup) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createSettlement({
        groupId: selectedGroup._id,
        to: settlementForm.to,
        amount: Number(settlementForm.amount),
        note: settlementForm.note,
      });

      setSettlementForm((current) => ({
        ...current,
        amount: "",
        note: "",
      }));

      setSuccess("Settlement recorded. No bank payment was initiated.");
      await loadGroupData(selectedGroup._id);
    } catch (err) {
      setError(err.response?.data?.message || "Could not record settlement.");
    } finally {
      setSaving(false);
    }
  };

  const monthlyTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.totalAmount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Together, transparently
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Shared Expenses
              </h1>
              <p className="mt-2 text-slate-500">
                Split bills, track balances, and keep everyone on the same page.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadGroups(selectedGroupId)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                onClick={() => setShowGroupForm(!showGroupForm)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus size={16} /> New group
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {showGroupForm && (
            <form
              onSubmit={handleCreateGroup}
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-bold">Create a group</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Group name
                  <input
                    className={`${inputClass} mt-1`}
                    value={groupForm.name}
                    onChange={(event) =>
                      setGroupForm({
                        ...groupForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Goa Trip, Flatmates..."
                    required
                  />
                </label>

                <label className="text-sm font-medium">
                  Description
                  <input
                    className={`${inputClass} mt-1`}
                    value={groupForm.description}
                    onChange={(event) =>
                      setGroupForm({
                        ...groupForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  Member emails
                  <textarea
                    className={`${inputClass} mt-1`}
                    rows={3}
                    value={groupForm.memberEmails}
                    onChange={(event) =>
                      setGroupForm({
                        ...groupForm,
                        memberEmails: event.target.value,
                      })
                    }
                    placeholder={"friend@example.com, roommate@example.com"}
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Separate emails with commas or new lines. Members must
                    already have registered accounts. You are added automatically.
                  </span>
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  disabled={saving}
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create group"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Users className="mx-auto mb-3 text-blue-700" size={36} />
              <h2 className="text-xl font-bold">No groups yet</h2>
              <p className="mt-2 text-sm text-slate-500">
                Create your first group to start splitting expenses.
              </p>
              <button
                onClick={() => setShowGroupForm(true)}
                className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm font-semibold">
                  Group
                  <select
                    className={`${inputClass} min-w-0 sm:w-72`}
                    value={selectedGroupId}
                    onChange={(event) =>
                      setSelectedGroupId(event.target.value)
                    }
                  >
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> Add expense
                </button>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  icon={<Users size={20} />}
                  label="Members"
                  value={members.length}
                />
                <SummaryCard
                  icon={<ReceiptText size={20} />}
                  label="Recorded expenses"
                  value={expenses.length}
                />
                <SummaryCard
                  icon={<Wallet size={20} />}
                  label="Total group spending"
                  value={money(monthlyTotal)}
                />
              </div>

              {showExpenseForm && (
                <form
                  onSubmit={handleCreateExpense}
                  className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-lg font-bold">Add shared expense</h2>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm font-medium">
                      Expense title
                      <input
                        className={`${inputClass} mt-1`}
                        value={expenseForm.title}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            title: event.target.value,
                          })
                        }
                        placeholder="Dinner, rent, cab..."
                        required
                      />
                    </label>

                    <label className="text-sm font-medium">
                      Total amount (₹)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className={`${inputClass} mt-1`}
                        value={expenseForm.totalAmount}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            totalAmount: event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label className="text-sm font-medium">
                      Paid by
                      <select
                        className={`${inputClass} mt-1`}
                        value={expenseForm.paidBy}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            paidBy: event.target.value,
                          })
                        }
                        required
                      >
                        {members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name || member.email}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm font-medium">
                      Category
                      <select
                        className={`${inputClass} mt-1`}
                        value={expenseForm.category}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            category: event.target.value,
                          })
                        }
                      >
                        {["Food", "Travel", "Rent", "Shopping", "Utilities", "Other"].map(
                          (category) => (
                            <option key={category}>{category}</option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="text-sm font-medium">
                      Date
                      <input
                        type="date"
                        className={`${inputClass} mt-1`}
                        value={expenseForm.date}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            date: event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label className="text-sm font-medium">
                      Split method
                      <select
                        className={`${inputClass} mt-1`}
                        value={expenseForm.splitType}
                        onChange={(event) =>
                          setExpenseForm({
                            ...expenseForm,
                            splitType: event.target.value,
                          })
                        }
                      >
                        <option value="equal">Equal split</option>
                        <option value="custom">Custom amounts</option>
                        <option value="percentage">Percentage split</option>
                      </select>
                    </label>
                  </div>

                  {expenseForm.splitType !== "equal" && (
                    <div className="mt-5 rounded-xl border border-slate-200 p-4">
                      <h3 className="mb-3 font-semibold">
                        {expenseForm.splitType === "custom"
                          ? "Enter each member's share"
                          : "Enter each member's percentage"}
                      </h3>

                      <div className="space-y-3">
                        {members.map((member) => (
                          <div
                            key={member._id}
                            className="grid items-center gap-3 sm:grid-cols-[1fr_180px]"
                          >
                            <span className="text-sm font-medium">
                              {member.name || member.email}
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                max={
                                  expenseForm.splitType === "percentage"
                                    ? 100
                                    : undefined
                                }
                                className={inputClass}
                                placeholder={
                                  expenseForm.splitType === "custom"
                                    ? "Amount in ₹"
                                    : "Percentage %"
                                }
                                value={
                                  expenseForm.splitType === "custom"
                                    ? splitValues[member._id]?.amount ?? ""
                                    : splitValues[member._id]?.percentage ?? ""
                                }
                                onChange={(event) =>
                                  setSplitValues((current) => ({
                                    ...current,
                                    [member._id]: {
                                      ...current[member._id],
                                      [expenseForm.splitType === "custom"
                                        ? "amount"
                                        : "percentage"]: event.target.value,
                                    },
                                  }))
                                }
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        {expenseForm.splitType === "custom"
                          ? "All member amounts must add up to the total expense."
                          : "All percentages must add up to 100%."}
                      </p>
                    </div>
                  )}

                  <label className="mt-4 block text-sm font-medium">
                    Note (optional)
                    <input
                      className={`${inputClass} mt-1`}
                      value={expenseForm.note}
                      onChange={(event) =>
                        setExpenseForm({
                          ...expenseForm,
                          note: event.target.value,
                        })
                      }
                      placeholder="Add a note..."
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      disabled={saving}
                      className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save expense"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExpenseForm(false)}
                      className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold">Expense history</h2>

                  {expenses.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No shared expenses recorded for this group.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <article
                          key={expense._id}
                          className="rounded-xl border border-slate-100 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{expense.title}</h3>
                              <p className="mt-1 text-xs text-slate-500">
                                {expense.category} ·{" "}
                                {new Date(expense.date).toLocaleDateString("en-IN")}
                              </p>
                              <p className="mt-2 text-sm text-slate-600">
                                Paid by{" "}
                                <strong>
                                  {expense.paidBy?.name ||
                                    expense.paidBy?.email ||
                                    "Group member"}
                                </strong>
                              </p>
                            </div>
                            <p className="whitespace-nowrap text-lg font-bold">
                              {money(expense.totalAmount)}
                            </p>
                          </div>

                          <div className="mt-3 border-t border-slate-100 pt-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {expense.splitType} split
                            </p>
                            <div className="space-y-2">
                              {expense.splits.map((split) => (
                                <div
                                  key={split.user?._id}
                                  className="flex justify-between gap-3 text-sm"
                                >
                                  <span className="text-slate-600">
                                    {split.user?.name || split.user?.email}
                                  </span>
                                  <span className="font-medium">
                                    {money(split.amount)}
                                    {split.percentage != null &&
                                      ` (${split.percentage}%)`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-lg font-bold">Member balances</h2>
                    <p className="mb-4 text-xs text-slate-500">
                      Positive means should receive; negative means owes money.
                    </p>

                    <div className="space-y-3">
                      {balances.map((item) => (
                        <div
                          key={item.user._id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold">
                              {item.user.name || item.user.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {Number(item.balance) > 0
                                ? "Should receive"
                                : Number(item.balance) < 0
                                  ? "Owes"
                                  : "Settled"}
                            </p>
                          </div>
                          <p
                            className={`font-bold ${
                              Number(item.balance) > 0
                                ? "text-emerald-700"
                                : Number(item.balance) < 0
                                  ? "text-rose-700"
                                  : "text-slate-600"
                            }`}
                          >
                            {money(Math.abs(item.balance))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <ArrowLeftRight className="text-blue-700" size={20} />
                      <h2 className="text-lg font-bold">Record settlement</h2>
                    </div>

                    <p className="mb-4 text-xs text-slate-500">
                      Record money you have sent to another member. This does
                      not make an actual UPI or bank transfer.
                    </p>

                    <form onSubmit={handleSettlement} className="space-y-3">
                      <label className="block text-sm font-medium">
                        Paid to
                        <select
                          className={`${inputClass} mt-1`}
                          value={settlementForm.to}
                          onChange={(event) =>
                            setSettlementForm({
                              ...settlementForm,
                              to: event.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select member</option>
                          {members.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name || member.email}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm font-medium">
                        Amount (₹)
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className={`${inputClass} mt-1`}
                          value={settlementForm.amount}
                          onChange={(event) =>
                            setSettlementForm({
                              ...settlementForm,
                              amount: event.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <label className="block text-sm font-medium">
                        Note
                        <input
                          className={`${inputClass} mt-1`}
                          value={settlementForm.note}
                          onChange={(event) =>
                            setSettlementForm({
                              ...settlementForm,
                              note: event.target.value,
                            })
                          }
                          placeholder="UPI, cash, etc."
                        />
                      </label>

                      <button
                        disabled={saving}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Record settlement
                      </button>
                    </form>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

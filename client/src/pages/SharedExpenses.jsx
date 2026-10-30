
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Wallet,
  RefreshCw,
  ArrowLeftRight,
  ReceiptText,
  X,
  CalendarDays,
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

const categories = [
  "Food",
  "Travel",
  "Rent",
  "Shopping",
  "Utilities",
  "Health",
  "Entertainment",
  "Other",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialExpense = {
  title: "",
  totalAmount: "",
  category: "Food",
  date: getToday(),
  paidBy: "",
  splitType: "equal",
  note: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  if (Array.isArray(response?.data)) return response.data;

  return [];
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
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const members = useMemo(
    () => selectedGroup?.members || [],
    [selectedGroup]
  );

  const loadGroups = useCallback(async (preferredId = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await getSharedGroups();
      const result = getArray(response, ["groups"]);

      setGroups(result);

      const nextId =
        preferredId && result.some((group) => group._id === preferredId)
          ? preferredId
          : result.some((group) => group._id === selectedGroupId)
            ? selectedGroupId
            : result[0]?._id || "";

      setSelectedGroupId(nextId);

      return result;
    } catch (err) {
      setError(getErrorMessage(err, "Could not load groups."));
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  const loadGroupData = useCallback(async (groupId) => {
    if (!groupId) {
      setExpenses([]);
      setBalances([]);
      return;
    }

    setDetailsLoading(true);
    setError("");

    try {
      const [expenseResponse, balanceResponse] = await Promise.all([
        getGroupExpenses(groupId),
        getGroupBalances(groupId),
      ]);

      setExpenses(
        getArray(expenseResponse, ["expenses"])
      );

      setBalances(
        getArray(balanceResponse, ["balances"])
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not load group details."));
      setExpenses([]);
      setBalances([]);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadGroupData(selectedGroupId);
  }, [selectedGroupId, loadGroupData]);

  useEffect(() => {
    if (!members.length) {
      setExpenseForm((current) => ({
        ...current,
        paidBy: "",
      }));
      return;
    }

    setExpenseForm((current) => ({
      ...current,
      paidBy: members.some((member) => member._id === current.paidBy)
        ? current.paidBy
        : members[0]._id,
    }));

    setSplitValues((current) => {
      const next = {};

      members.forEach((member) => {
        next[member._id] = current[member._id] || {
          amount: "",
          percentage: "",
        };
      });

      return next;
    });

    setSettlementForm((current) => ({
      ...current,
      to: members.some((member) => member._id === current.to)
        ? current.to
        : members.find(
            (member) => member._id !== selectedGroup?.createdBy?._id
          )?._id || "",
    }));
  }, [selectedGroupId, members, selectedGroup]);

  const handleRefresh = async () => {
    const result = await loadGroups(selectedGroupId);

    if (selectedGroupId && result.some((group) => group._id === selectedGroupId)) {
      await loadGroupData(selectedGroupId);
    }
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    if (!groupForm.name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    const memberEmails = groupForm.memberEmails
      .split(/[\n,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const invalidEmail = memberEmails.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (invalidEmail) {
      setError(`Invalid email address: ${invalidEmail}`);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await createSharedGroup({
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        memberEmails: [...new Set(memberEmails)],
      });

      const group = response?.group || response?.data?.group || response?.data || response;

      setGroupForm({
        name: "",
        description: "",
        memberEmails: "",
      });

      setShowGroupForm(false);
      setSuccess("Group created successfully.");

      await loadGroups(group?._id || "");
    } catch (err) {
      const missing = err?.response?.data?.missingEmails;

      setError(
        missing?.length
          ? `Register these emails first: ${missing.join(", ")}`
          : getErrorMessage(err, "Could not create group.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExpense = async (event) => {
    event.preventDefault();

    if (!selectedGroup) {
      setError("Please select a group.");
      return;
    }

    const total = Number(expenseForm.totalAmount);

    if (!expenseForm.title.trim()) {
      setError("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(total) || total <= 0) {
      setError("Enter a valid total amount.");
      return;
    }

    if (!expenseForm.paidBy) {
      setError("Please select who paid.");
      return;
    }

    let splits = [];

    if (expenseForm.splitType === "custom") {
      splits = members.map((member) => ({
        user: member._id,
        amount: Number(splitValues[member._id]?.amount || 0),
      }));

      const splitTotal = splits.reduce(
        (sum, split) => sum + split.amount,
        0
      );

      if (splits.some((split) => split.amount < 0)) {
        setError("Split amounts cannot be negative.");
        return;
      }

      if (Math.abs(splitTotal - total) > 0.01) {
        setError("All member amounts must add up to the total expense.");
        return;
      }
    }

    if (expenseForm.splitType === "percentage") {
      splits = members.map((member) => ({
        user: member._id,
        percentage: Number(splitValues[member._id]?.percentage || 0),
      }));

      const percentageTotal = splits.reduce(
        (sum, split) => sum + split.percentage,
        0
      );

      if (splits.some(
        (split) => split.percentage < 0 || split.percentage > 100
      )) {
        setError("Each percentage must be between 0 and 100.");
        return;
      }

      if (Math.abs(percentageTotal - 100) > 0.01) {
        setError("All percentages must add up to 100%.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createSharedExpense({
        groupId: selectedGroup._id,
        title: expenseForm.title.trim(),
        totalAmount: total,
        paidBy: expenseForm.paidBy,
        category: expenseForm.category,
        date: expenseForm.date,
        splitType: expenseForm.splitType,
        splits,
        note: expenseForm.note.trim(),
      });

      setExpenseForm({
        ...initialExpense,
        date: getToday(),
        paidBy: members[0]?._id || "",
      });

      setSplitValues({});
      setShowExpenseForm(false);
      setSuccess("Shared expense added successfully.");

      await loadGroupData(selectedGroup._id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save shared expense."));
    } finally {
      setSaving(false);
    }
  };

  const handleSettlement = async (event) => {
    event.preventDefault();

    if (!selectedGroup) return;

    const amount = Number(settlementForm.amount);

    if (!settlementForm.to) {
      setError("Please select a member.");
      return;
    }

    if (settlementForm.to === selectedGroup.createdBy?._id) {
      setError("Select another member.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid settlement amount.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createSettlement({
        groupId: selectedGroup._id,
        to: settlementForm.to,
        amount,
        note: settlementForm.note.trim(),
      });

      setSettlementForm((current) => ({
        ...current,
        amount: "",
        note: "",
      }));

      setSuccess(
        "Settlement recorded. No bank payment was initiated."
      );

      await loadGroupData(selectedGroup._id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not record settlement."));
    } finally {
      setSaving(false);
    }
  };

  const monthlyTotal = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) => sum + Number(expense.totalAmount || 0),
        0
      ),
    [expenses]
  );

  const updateExpenseField = (field, value) => {
    setExpenseForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateGroupField = (field, value) => {
    setGroupForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSettlementField = (field, value) => {
    setSettlementForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Header */}
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
                type="button"
                onClick={handleRefresh}
                disabled={loading || detailsLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowGroupForm((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus size={16} />
                New group
              </button>
            </div>
          </header>

          {/* Notifications */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              <span>{success}</span>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Create group */}
          {showGroupForm && (
            <form
              onSubmit={handleCreateGroup}
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Create a group</h2>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  aria-label="Close group form"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Group name
                  <input
                    className={`${inputClass} mt-1`}
                    value={groupForm.name}
                    onChange={(event) =>
                      updateGroupField("name", event.target.value)
                    }
                    placeholder="Goa Trip, Flatmates..."
                    maxLength={80}
                    required
                  />
                </label>

                <label className="text-sm font-medium">
                  Description
                  <input
                    className={`${inputClass} mt-1`}
                    value={groupForm.description}
                    onChange={(event) =>
                      updateGroupField("description", event.target.value)
                    }
                    placeholder="Optional"
                    maxLength={200}
                  />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  Member emails
                  <textarea
                    className={`${inputClass} mt-1`}
                    rows={3}
                    value={groupForm.memberEmails}
                    onChange={(event) =>
                      updateGroupField("memberEmails", event.target.value)
                    }
                    placeholder="friend@example.com, roommate@example.com"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Separate emails with commas or new lines. Members must
                    already have registered accounts. You are added automatically.
                  </span>
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
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

          {/* Groups loading */}
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
                type="button"
                onClick={() => setShowGroupForm(true)}
                className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <>
              {/* Group selector */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm font-semibold">
                  Group
                  <select
                    className={`${inputClass} min-w-0 sm:w-72`}
                    value={selectedGroupId}
                    onChange={(event) => {
                      setSelectedGroupId(event.target.value);
                      setShowExpenseForm(false);
                      setError("");
                    }}
                  >
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setExpenseForm({
                      ...initialExpense,
                      date: getToday(),
                      paidBy: members[0]?._id || "",
                    });
                    setSplitValues({});
                    setShowExpenseForm((value) => !value);
                  }}
                  disabled={!selectedGroup || members.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add expense
                </button>
              </div>

              {/* Summary */}
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

              {/* Add shared expense */}
              {showExpenseForm && (
                <form
                  onSubmit={handleCreateExpense}
                  className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-lg font-bold">
                    Add shared expense
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm font-medium">
                      Expense title
                      <input
                        className={`${inputClass} mt-1`}
                        value={expenseForm.title}
                        onChange={(event) =>
                          updateExpenseField("title", event.target.value)
                        }
                        placeholder="Dinner, rent, cab..."
                        maxLength={100}
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
                          updateExpenseField("totalAmount", event.target.value)
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
                          updateExpenseField("paidBy", event.target.value)
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

                    <label className="text-sm font-medium">
                      Category
                      <select
                        className={`${inputClass} mt-1`}
                        value={expenseForm.category}
                        onChange={(event) =>
                          updateExpenseField("category", event.target.value)
                        }
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm font-medium">
                      Date
                      <input
                        type="date"
                        className={`${inputClass} mt-1`}
                        value={expenseForm.date}
                        onChange={(event) =>
                          updateExpenseField("date", event.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="text-sm font-medium">
                      Split method
                      <select
                        className={`${inputClass} mt-1`}
                        value={expenseForm.splitType}
                        onChange={(event) => {
                          updateExpenseField("splitType", event.target.value);
                          setSplitValues({});
                        }}
                      >
                        <option value="equal">Equal split</option>
                        <option value="custom">Custom amounts</option>
                        <option value="percentage">Percentage split</option>
                      </select>
                    </label>
                  </div>

                  {/* Custom split */}
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
                        updateExpenseField("note", event.target.value)
                      }
                      placeholder="Add a note..."
                      maxLength={300}
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="submit"
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

              {/* Group details */}
              {detailsLoading ? (
                <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
                  Loading group details...
                </div>
              ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">

                  {/* Expense history */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold">
                      Expense history
                    </h2>

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
                              <div className="min-w-0">
                                <h3 className="font-semibold">
                                  {expense.title}
                                </h3>

                                <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                                  <span>{expense.category}</span>
                                  <span>·</span>
                                  <CalendarDays size={13} />
                                  {expense.date
                                    ? new Date(expense.date).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "Date unavailable"}
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
                                {expense.splitType || "Equal"} split
                              </p>

                              <div className="space-y-2">
                                {(expense.splits || []).map((split, index) => (
                                  <div
                                    key={split._id || split.user?._id || index}
                                    className="flex justify-between gap-3 text-sm"
                                  >
                                    <span className="text-slate-600">
                                      {split.user?.name ||
                                        split.user?.email ||
                                        "Member"}
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

                  {/* Balances and settlement */}
                  <div className="space-y-6">

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-1 text-lg font-bold">
                        Member balances
                      </h2>

                      <p className="mb-4 text-xs text-slate-500">
                        Positive means should receive; negative means owes money.
                      </p>

                      {balances.length === 0 ? (
                        <p className="py-5 text-center text-sm text-slate-500">
                          No balances available yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {balances.map((item, index) => (
                            <div
                              key={item.user?._id || index}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                            >
                              <div>
                                <p className="text-sm font-semibold">
                                  {item.user?.name ||
                                    item.user?.email ||
                                    "Member"}
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
                                {money(Math.abs(Number(item.balance) || 0))}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <ArrowLeftRight className="text-blue-700" size={20} />
                        <h2 className="text-lg font-bold">
                          Record settlement
                        </h2>
                      </div>

                      <p className="mb-4 text-xs text-slate-500">
                        Record money you have sent to another member. This does
                        not make an actual UPI or bank transfer.
                      </p>

                      <form
                        onSubmit={handleSettlement}
                        className="space-y-3"
                      >
                        <label className="block text-sm font-medium">
                          Paid to
                          <select
                            className={`${inputClass} mt-1`}
                            value={settlementForm.to}
                            onChange={(event) =>
                              updateSettlementField("to", event.target.value)
                            }
                            required
                          >
                            <option value="">Select member</option>

                            {members
                              .filter(
                                (member) =>
                                  member._id !== selectedGroup?.createdBy?._id
                              )
                              .map((member) => (
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
                              updateSettlementField("amount", event.target.value)
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
                              updateSettlementField("note", event.target.value)
                            }
                            placeholder="UPI, cash, etc."
                            maxLength={200}
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={saving || !settlementForm.to}
                          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {saving ? "Recording..." : "Record settlement"}
                        </button>
                      </form>
                    </section>
                  </div>
                </div>
              )}
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
      <p className="mt-1 break-words text-2xl font-bold">{value}</p>
    </div>
  );
}

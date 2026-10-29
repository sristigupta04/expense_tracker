
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Search,
  Landmark,
  CreditCard,
  Banknote,
  Pencil,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerBankAccounts";

const starterAccounts = [
  {
    id: "cash-wallet",
    name: "Cash Wallet",
    bankName: "Cash",
    type: "Cash",
    lastFour: "",
    balance: 2500,
    color: "#0D21A1",
  },
  {
    id: "main-savings",
    name: "Savings Account",
    bankName: "My Bank",
    type: "Savings",
    lastFour: "4821",
    balance: 18500,
    color: "#2563EB",
  },
];

const emptyForm = {
  name: "",
  bankName: "",
  type: "Savings",
  lastFour: "",
  balance: "",
  color: "#0D21A1",
};

const colors = ["#0D21A1", "#2563EB", "#0F766E", "#7C3AED", "#D97706"];

function loadAccounts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterAccounts;
  } catch {
    return starterAccounts;
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default function BankAccounts() {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      setError("Could not save accounts in this browser.");
    }
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return accounts.filter((account) =>
      `${account.name} ${account.bankName} ${account.type} ${account.lastFour}`
        .toLowerCase()
        .includes(query)
    );
  }, [accounts, search]);

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance || 0),
    0
  );

  const bankCount = accounts.filter((account) => account.type !== "Cash").length;

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setSaved(false);
    setShowForm(true);
  }

  function openEditForm(account) {
    setEditingId(account.id);
    setForm({
      name: account.name,
      bankName: account.bankName,
      type: account.type,
      lastFour: account.lastFour || "",
      balance: String(account.balance),
      color: account.color || "#0D21A1",
    });
    setError("");
    setSaved(false);
    setShowForm(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);

    const balance = Number(form.balance);

    if (!form.name.trim() || !form.bankName.trim()) {
      setError("Please enter an account name and bank/provider name.");
      return;
    }

    if (form.balance.trim() === "" || !Number.isFinite(balance) || balance < 0) {
      setError("Enter a valid non-negative opening balance.");
      return;
    }

    if (form.type !== "Cash" && form.lastFour && !/^\d{4}$/.test(form.lastFour)) {
      setError("Enter only the last 4 digits of the account number.");
      return;
    }

    const accountData = {
      ...form,
      name: form.name.trim(),
      bankName: form.bankName.trim(),
      lastFour: form.type === "Cash" ? "" : form.lastFour,
      balance,
    };

    if (editingId) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === editingId ? { ...account, ...accountData } : account
        )
      );
    } else {
      setAccounts((current) => [
        {
          ...accountData,
          id: `account-${Date.now()}`,
        },
        ...current,
      ]);
    }

    setShowForm(false);
    setSaved(true);
  }

  function deleteAccount() {
    setAccounts((current) =>
      current.filter((account) => account.id !== deleteId)
    );
    setDeleteId(null);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-800">
              <Landmark size={15} />
              Accounts
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Bank Accounts
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage your bank accounts, savings and cash balances in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E]"
          >
            <Plus size={18} />
            Add account
          </button>
        </header>

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            Account changes saved in this browser.
          </div>
        )}

        {error && !showForm && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Summary */}
        <section className="mb-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-[#03045E] to-[#2563EB] p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-100">Total available balance</p>
              <div className="rounded-xl bg-white/15 p-2.5">
                <Wallet size={22} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold sm:text-4xl">
              {formatMoney(totalBalance)}
            </p>
            <p className="mt-2 text-sm text-blue-100">
              Across {accounts.length} account{accounts.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Linked bank accounts</p>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
                <Landmark size={22} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold">{bankCount}</p>
            <p className="mt-2 text-sm text-slate-500">
              Plus {accounts.length - bankCount} cash wallet
              {accounts.length - bankCount === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        {/* Search */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search size={19} className="shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search accounts or banks..."
            aria-label="Search accounts"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Account cards */}
        {filteredAccounts.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2">
            {filteredAccounts.map((account) => (
              <article
                key={account.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="h-1.5" style={{ backgroundColor: account.color }} />

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="rounded-xl p-3 text-white"
                        style={{ backgroundColor: account.color }}
                      >
                        {account.type === "Cash" ? (
                          <Banknote size={23} />
                        ) : account.type === "Credit Card" ? (
                          <CreditCard size={23} />
                        ) : (
                          <Landmark size={23} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-bold">{account.name}</h2>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {account.bankName}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {account.type}
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {account.type === "Credit Card" ? "Outstanding balance" : "Current balance"}
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatMoney(account.balance)}
                    </p>
                    {account.lastFour && (
                      <p className="mt-2 text-sm text-slate-500">
                        Account ending in •••• {account.lastFour}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                      Manual account entry
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(account)}
                        aria-label={`Edit ${account.name}`}
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(account.id)}
                        aria-label={`Delete ${account.name}`}
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Landmark size={32} className="mx-auto text-slate-300" />
            <h2 className="mt-3 font-bold">No accounts found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or add a new account.
            </p>
          </div>
        )}

        <div className="mt-7 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <IndianRupee size={19} className="mt-0.5 shrink-0 text-blue-800" />
          <p className="text-xs leading-5 text-slate-600">
            Balances are entered manually and stored in this browser. They are
            not fetched from your bank and do not automatically update when you
            add transactions. Never enter your PIN, password, CVV or OTP here.
          </p>
        </div>
      </div>

      {/* Add / Edit account modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 id="account-form-title" className="text-xl font-bold">
                  {editingId ? "Edit account" : "Add new account"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter account details below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="account-name" className="mb-1.5 block text-sm font-semibold">
                  Account name
                </label>
                <input
                  id="account-name"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Personal Savings"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label htmlFor="bank-name" className="mb-1.5 block text-sm font-semibold">
                  Bank / provider name
                </label>
                <input
                  id="bank-name"
                  required
                  maxLength={80}
                  value={form.bankName}
                  onChange={(event) => setForm({ ...form, bankName: event.target.value })}
                  placeholder="e.g. SBI, HDFC, Cash"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label htmlFor="account-type" className="mb-1.5 block text-sm font-semibold">
                  Account type
                </label>
                <select
                  id="account-type"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="Savings">Savings account</option>
                  <option value="Current">Current account</option>
                  <option value="Salary">Salary account</option>
                  <option value="Credit Card">Credit card</option>
                  <option value="Cash">Cash wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {form.type !== "Cash" && (
                <div>
                  <label htmlFor="account-last-four" className="mb-1.5 block text-sm font-semibold">
                    Last 4 digits (optional)
                  </label>
                  <input
                    id="account-last-four"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.lastFour}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        lastFour: event.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    placeholder="4821"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              )}

              <div>
                <label htmlFor="account-balance" className="mb-1.5 block text-sm font-semibold">
                  {form.type === "Credit Card" ? "Outstanding balance (₹)" : "Opening balance (₹)"}
                </label>
                <input
                  id="account-balance"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.balance}
                  onChange={(event) => setForm({ ...form, balance: event.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Card color</p>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choose color ${color}`}
                      aria-pressed={form.color === color}
                      onClick={() => setForm({ ...form, color })}
                      className={`h-9 w-9 rounded-full border-2 ${
                        form.color === color
                          ? "border-slate-900 ring-2 ring-slate-300 ring-offset-2"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#03045E]"
                >
                  {editingId ? "Save changes" : "Add account"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setDeleteId(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-700 w-fit">
              <Trash2 size={23} />
            </div>
            <h2 id="delete-account-title" className="text-xl font-bold">
              Remove this account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This removes the account entry from this browser. It does not
              close or change your real bank account.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

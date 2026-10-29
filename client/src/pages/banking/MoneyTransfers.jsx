import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  X,
} from "lucide-react";

const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const TRANSFERS_KEY = "expenseTrackerTransfers";

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const initialForm = {
  fromAccountId: "",
  toAccountId: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  reference: "",
  notes: "",
};

export default function MoneyTransfers() {
  const [accounts, setAccounts] = useState(() =>
    readStorage(ACCOUNTS_KEY)
  );

  const [transfers, setTransfers] = useState(() =>
    readStorage(TRANSFERS_KEY)
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refreshData = () => {
    setAccounts(readStorage(ACCOUNTS_KEY));
    setTransfers(readStorage(TRANSFERS_KEY));
  };

  const filteredTransfers = useMemo(() => {
    const query = search.toLowerCase();

    return transfers
      .filter((transfer) => {
        const fromAccount = accounts.find(
          (account) =>
            String(account.id) === String(transfer.fromAccountId)
        );

        const toAccount = accounts.find(
          (account) =>
            String(account.id) === String(transfer.toAccountId)
        );

        const searchableText = [
          fromAccount?.accountName,
          toAccount?.accountName,
          transfer.reference,
          transfer.notes,
          transfer.date,
          transfer.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesStatus =
          statusFilter === "All" || transfer.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [transfers, accounts, search, statusFilter]);

  const totalTransferred = transfers
    .filter((transfer) => transfer.status === "Completed")
    .reduce(
      (sum, transfer) => sum + (Number(transfer.amount) || 0),
      0
    );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (accounts.length < 2) {
      setError("Transfer ke liye kam se kam 2 bank accounts add karo.");
      return;
    }

    if (
      !form.fromAccountId ||
      !form.toAccountId ||
      form.fromAccountId === form.toAccountId
    ) {
      setError("Different source aur destination accounts select karo.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Transfer amount zero se greater hona chahiye.");
      return;
    }

    if (!form.date) {
      setError("Transfer date select karo.");
      return;
    }

    const fromAccount = accounts.find(
      (account) => String(account.id) === form.fromAccountId
    );

    const toAccount = accounts.find(
      (account) => String(account.id) === form.toAccountId
    );

    if (!fromAccount || !toAccount) {
      setError("Selected bank account nahi mila.");
      return;
    }

    if (
      fromAccount.currency &&
      toAccount.currency &&
      fromAccount.currency !== toAccount.currency
    ) {
      setError(
        "Dono accounts ki currency same honi chahiye. Currency conversion abhi supported nahi hai."
      );
      return;
    }

    const newTransfer = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      fromAccountName: fromAccount.accountName,
      toAccountName: toAccount.accountName,
      amount,
      date: form.date,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
      status: "Completed",
      createdAt: new Date().toISOString(),
    };

    try {
      const currentTransfers = readStorage(TRANSFERS_KEY);

      localStorage.setItem(
        TRANSFERS_KEY,
        JSON.stringify([newTransfer, ...currentTransfers])
      );

      setTransfers([newTransfer, ...currentTransfers]);
      setForm(initialForm);
      setShowForm(false);
      setSuccess("Transfer record successfully save ho gaya.");
    } catch {
      setError("Transfer save nahi hua. Browser storage check karo.");
    }
  };

  const handleDelete = (transferId) => {
    const confirmed = window.confirm(
      "Kya tum ye transfer record delete karna chahti ho?"
    );

    if (!confirmed) return;

    const updatedTransfers = transfers.filter(
      (transfer) => String(transfer.id) !== String(transferId)
    );

    try {
      localStorage.setItem(
        TRANSFERS_KEY,
        JSON.stringify(updatedTransfers)
      );

      setTransfers(updatedTransfers);
      setSuccess("Transfer record delete ho gaya.");
      setError("");
    } catch {
      setError("Transfer delete nahi ho paya.");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/banking"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
          >
            <ArrowLeftLeftIcon />
            Banking Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Money Transfers
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track money transfers between your linked accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refreshData();
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "New Transfer"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Completed Transfers"
          value={transfers.filter((item) => item.status === "Completed").length}
          icon={<ArrowLeftRight size={21} />}
        />

        <SummaryCard
          title="Total Transferred"
          value={formatCurrency(totalTransferred)}
          icon={<Wallet size={21} />}
        />
      </div>

      {/* New Transfer Form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Create a Transfer Record</h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose source and destination accounts and enter the amount.
          </p>

          {accounts.length < 2 && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Pehle at least 2 accounts add karo.{" "}
              <Link
                to="/bank-accounts/add"
                className="font-semibold underline"
              >
                Add bank account
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="From Account">
                <select
                  required
                  name="fromAccountId"
                  value={form.fromAccountId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select source account</option>
                  {accounts
                    .filter((account) => account.status === "Active")
                    .map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.accountName} — {account.bankName}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="To Account">
                <select
                  required
                  name="toAccountId"
                  value={form.toAccountId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select destination account</option>
                  {accounts
                    .filter(
                      (account) =>
                        account.status === "Active" &&
                        String(account.id) !== form.fromAccountId
                    )
                    .map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.accountName} — {account.bankName}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Transfer Amount">
                <input
                  required
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </Field>

              <Field label="Transfer Date">
                <input
                  required
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Reference Number">
                <input
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  placeholder="Optional reference"
                  className={inputClass}
                />
              </Field>

              <Field label="Notes">
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setError("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={accounts.filter((a) => a.status === "Active").length < 2}
                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Transfer Record
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search accounts or reference..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="All">All statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Transfer Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold">Transfer History</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredTransfers.length} transfer records
          </p>
        </div>

        {filteredTransfers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ArrowLeftRight size={27} />
            </div>

            <h3 className="mt-4 font-semibold">No transfers found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add a transfer record or change your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Transfer Route</th>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.map((transfer) => {
                  const fromAccount = accounts.find(
                    (account) =>
                      String(account.id) === String(transfer.fromAccountId)
                  );

                  const toAccount = accounts.find(
                    (account) =>
                      String(account.id) === String(transfer.toAccountId)
                  );

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4">
                        {transfer.date}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                            <ArrowUpRight size={16} />
                          </div>

                          <div>
                            <p className="font-medium">
                              {fromAccount?.accountName ||
                                transfer.fromAccountName ||
                                "Source account"}
                            </p>
                            <div className="my-1 flex items-center gap-1 text-xs text-slate-400">
                              <ArrowRight size={12} />
                              <span>
                                {toAccount?.accountName ||
                                  transfer.toAccountName ||
                                  "Destination account"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {transfer.reference || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                        {formatCurrency(transfer.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            transfer.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : transfer.status === "Failed"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {transfer.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(transfer.id)}
                          className="rounded-lg border border-rose-100 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          {icon}
        </div>
      </div>
      <p className="mt-4 break-words text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function ArrowLeftLeftIcon() {
  return <ArrowLeftRight size={16} />;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
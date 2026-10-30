
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  Plus,
  Search,
  ArrowUpRight,
  Wallet,
  X,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";

const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const TRANSFERS_KEY = "expenseTrackerTransfers";

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;
  }
};

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const initialForm = {
  fromAccountId: "",
  toAccountId: "",
  amount: "",
  date: getToday(),
  reference: "",
  notes: "",
};

const getId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          String(account.status || "Active").toLowerCase() === "active"
      ),
    [accounts]
  );

  const refreshData = () => {
    setAccounts(readStorage(ACCOUNTS_KEY));
    setTransfers(readStorage(TRANSFERS_KEY));
  };

  const filteredTransfers = useMemo(() => {
    const query = search.trim().toLowerCase();

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
          transfer.fromAccountName,
          transfer.toAccountName,
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
          statusFilter === "All" ||
          String(transfer.status || "Pending") === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );
  }, [transfers, accounts, search, statusFilter]);

  const completedTransfers = transfers.filter(
    (transfer) => transfer.status === "Completed"
  );

  const totalTransferred = completedTransfers.reduce(
    (sum, transfer) => sum + (Number(transfer.amount) || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const latestAccounts = readStorage(ACCOUNTS_KEY);
    setAccounts(latestAccounts);

    const active = latestAccounts.filter(
      (account) =>
        String(account.status || "Active").toLowerCase() === "active"
    );

    if (active.length < 2) {
      setError("Transfer ke liye kam se kam 2 active bank accounts add karo.");
      return;
    }

    if (!form.fromAccountId || !form.toAccountId) {
      setError("Source aur destination account select karo.");
      return;
    }

    if (form.fromAccountId === form.toAccountId) {
      setError("Source aur destination accounts different hone chahiye.");
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

    const fromAccount = latestAccounts.find(
      (account) =>
        String(account.id) === String(form.fromAccountId)
    );

    const toAccount = latestAccounts.find(
      (account) =>
        String(account.id) === String(form.toAccountId)
    );

    if (!fromAccount || !toAccount) {
      setError("Selected bank account nahi mila.");
      return;
    }

    if (
      String(fromAccount.status || "Active").toLowerCase() !== "active" ||
      String(toAccount.status || "Active").toLowerCase() !== "active"
    ) {
      setError("Dono selected accounts active hone chahiye.");
      return;
    }

    const fromCurrency = fromAccount.currency || "INR";
    const toCurrency = toAccount.currency || "INR";

    if (fromCurrency !== toCurrency) {
      setError(
        "Dono accounts ki currency same honi chahiye. Currency conversion abhi supported nahi hai."
      );
      return;
    }

    const newTransfer = {
      id: getId(),
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      fromAccountName: fromAccount.accountName,
      toAccountName: toAccount.accountName,
      amount,
      currency: fromCurrency,
      date: form.date,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
      status: "Completed",
      createdAt: new Date().toISOString(),
    };

    try {
      const currentTransfers = readStorage(TRANSFERS_KEY);
      const updatedTransfers = [newTransfer, ...currentTransfers];

      localStorage.setItem(
        TRANSFERS_KEY,
        JSON.stringify(updatedTransfers)
      );

      setTransfers(updatedTransfers);
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

    try {
      const currentTransfers = readStorage(TRANSFERS_KEY);

      const updatedTransfers = currentTransfers.filter(
        (transfer) => String(transfer.id) !== String(transferId)
      );

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

  const exportCSV = () => {
    if (filteredTransfers.length === 0) {
      setError("Export karne ke liye koi transfer record nahi hai.");
      return;
    }

    const headers = [
      "Date",
      "From Account",
      "To Account",
      "Reference",
      "Amount",
      "Currency",
      "Status",
      "Notes",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredTransfers.map((transfer) => {
      const fromAccount = accounts.find(
        (account) =>
          String(account.id) === String(transfer.fromAccountId)
      );

      const toAccount = accounts.find(
        (account) =>
          String(account.id) === String(transfer.toAccountId)
      );

      return [
        transfer.date,
        fromAccount?.accountName || transfer.fromAccountName,
        toAccount?.accountName || transfer.toAccountName,
        transfer.reference,
        transfer.amount,
        transfer.currency || "INR",
        transfer.status,
        transfer.notes,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `money-transfers-${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/banking"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
            >
              <ArrowLeftRight size={16} />
              Banking Dashboard
            </Link>

            <p className="mt-4 text-sm font-semibold text-[#2563EB]">
              Banking / Transfers
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Money Transfers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track transfer records between your linked accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              refreshData();
              setShowForm((previous) => !previous);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Close Form" : "New Transfer"}
          </button>
        </header>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <span className="font-bold">!</span>
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
        <section className="grid gap-4 sm:grid-cols-2">
          <SummaryCard
            title="Completed Transfers"
            value={completedTransfers.length}
            icon={<ArrowLeftRight size={21} />}
          />

          <SummaryCard
            title="Total Transferred"
            value={formatCurrency(totalTransferred)}
            icon={<Wallet size={21} />}
          />
        </section>

        {/* Transfer Form */}
        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
                <ArrowLeftRight size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Create a Transfer Record
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter transfer details between your accounts.
                </p>
              </div>
            </div>

            {activeAccounts.length < 2 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Pehle at least 2 active bank accounts add karo.{" "}
                <Link
                  to="/bank-accounts/add"
                  className="font-semibold underline"
                >
                  Add bank account
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

                    {activeAccounts.map((account, index) => (
                      <option
                        key={account.id || index}
                        value={String(account.id)}
                      >
                        {account.accountName || "Bank Account"}
                        {" — "}
                        {account.bankName || "Bank"}
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

                    {activeAccounts
                      .filter(
                        (account) =>
                          String(account.id) !== form.fromAccountId
                      )
                      .map((account, index) => (
                        <option
                          key={account.id || index}
                          value={String(account.id)}
                        >
                          {account.accountName || "Bank Account"}
                          {" — "}
                          {account.bankName || "Bank"}
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

              <div className="rounded-xl bg-blue-50/70 p-4 text-xs leading-5 text-slate-600">
                <strong className="text-blue-800">Important:</strong>{" "}
                This form saves a transfer record only. It does not move
                actual money or update real bank balances.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(initialForm);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={activeAccounts.length < 2}
                  className="rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Transfer Record
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accounts or reference..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:max-w-[220px]`}
          >
            <option value="All">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </section>

        {/* Transfer History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="font-bold">Transfer History</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTransfers.length} transfer records
            </p>
          </div>

          {filteredTransfers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ArrowLeftRight size={27} />
              </div>

              <h3 className="mt-4 font-semibold">
                No transfers found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add a transfer record or change your filters.
              </p>

              {search || statusFilter !== "All" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                  <RefreshCw size={14} />
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Transfer Route</th>
                    <th className="px-5 py-4 font-semibold">Reference</th>
                    <th className="px-5 py-4 text-right font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-center font-semibold">Action</th>
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
                      <tr
                        key={transfer.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(transfer.date)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                              <ArrowUpRight size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
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

                        <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-800">
                          {formatCurrency(
                            transfer.amount,
                            transfer.currency || "INR"
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={transfer.status} />
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/transfers/${transfer.id}`}
                              title="View transfer details"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                              View
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(transfer.id)}
                              title="Delete transfer"
                              className="rounded-lg border border-rose-100 p-2 text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-slate-600">
          <strong className="text-blue-800">Note:</strong>{" "}
          Transfers are stored as local browser records. Saving a transfer
          does not execute a real bank transaction or update bank balances.
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 break-words text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "Pending").toLowerCase();

  const color =
    normalized === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "failed"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {status || "Pending"}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

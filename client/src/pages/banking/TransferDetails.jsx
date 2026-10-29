import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Wallet,
  XCircle,
} from "lucide-react";

const TRANSFERS_KEY = "expenseTrackerTransfers";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";

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

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TransferDetails() {
  const { id } = useParams();

  const { transfer, accounts } = useMemo(() => {
    const savedTransfers = readStorage(TRANSFERS_KEY);
    const savedAccounts = readStorage(ACCOUNTS_KEY);

    return {
      transfer: savedTransfers.find(
        (item) => String(item.id) === String(id)
      ),
      accounts: savedAccounts,
    };
  }, [id]);

  if (!transfer) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ArrowLeftRight size={28} />
          </div>

          <h1 className="mt-4 text-xl font-bold">
            Transfer Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ye transfer record available nahi hai. Ho sakta hai ise delete kar diya gaya ho.
          </p>

          <Link
            to="/money-transfers"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <ArrowLeft size={17} />
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  const fromAccount = accounts.find(
    (account) =>
      String(account.id) === String(transfer.fromAccountId)
  );

  const toAccount = accounts.find(
    (account) =>
      String(account.id) === String(transfer.toAccountId)
  );

  const currency =
    fromAccount?.currency || toAccount?.currency || "INR";

  const status = transfer.status || "Pending";

  const statusConfig = {
    Completed: {
      icon: <CheckCircle2 size={18} />,
      className: "bg-emerald-50 text-emerald-700",
      description: "This transfer is marked as completed in your tracker.",
    },
    Pending: {
      icon: <Clock size={18} />,
      className: "bg-amber-50 text-amber-700",
      description: "This transfer is marked as pending in your tracker.",
    },
    Failed: {
      icon: <XCircle size={18} />,
      className: "bg-rose-50 text-rose-700",
      description: "This transfer is marked as failed in your tracker.",
    },
  };

  const statusInfo = statusConfig[status] || statusConfig.Pending;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      {/* Header */}
      <div>
        <Link
          to="/money-transfers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Money Transfers
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Banking / Transfers / Details
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Transfer Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View the complete information for this transfer record.
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusInfo.className}`}
          >
            {statusInfo.icon}
            {status}
          </span>
        </div>
      </div>

      {/* Amount card */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-center gap-3 text-blue-100">
          <div className="rounded-xl bg-white/10 p-3">
            <ArrowLeftRight size={24} />
          </div>

          <div>
            <p className="text-sm">Transfer Amount</p>
            <p className="mt-1 text-xs text-blue-200">
              Reference: {transfer.reference || "Not provided"}
            </p>
          </div>
        </div>

        <h2 className="mt-7 break-words text-3xl font-bold sm:text-4xl">
          {formatCurrency(transfer.amount, currency)}
        </h2>

        <p className="mt-3 text-sm text-blue-100">
          {statusInfo.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
            <CalendarDays size={16} />
            {formatDate(transfer.date)}
          </span>

          <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
            <Hash size={16} />
            ID: {String(transfer.id).slice(0, 12)}
          </span>
        </div>
      </section>

      {/* Transfer route */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold">Transfer Route</h2>

        <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <AccountPanel
            label="From Account"
            account={fromAccount}
            fallbackName={transfer.fromAccountName}
            fallbackId={transfer.fromAccountId}
            type="from"
          />

          <div className="flex justify-center">
            <div className="rounded-full border border-blue-100 bg-blue-50 p-3 text-blue-700">
              <ArrowRight size={22} />
            </div>
          </div>

          <AccountPanel
            label="To Account"
            account={toAccount}
            fallbackName={transfer.toAccountName}
            fallbackId={transfer.toAccountId}
            type="to"
          />
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold">Transfer Information</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem
            icon={<CalendarDays size={18} />}
            label="Transfer Date"
            value={formatDate(transfer.date)}
          />

          <DetailItem
            icon={<Hash size={18} />}
            label="Reference Number"
            value={transfer.reference || "Not provided"}
          />

          <DetailItem
            icon={<CheckCircle2 size={18} />}
            label="Status"
            value={status}
          />

          <DetailItem
            icon={<Wallet size={18} />}
            label="Currency"
            value={currency}
          />

          <DetailItem
            icon={<Clock size={18} />}
            label="Created At"
            value={formatDateTime(transfer.createdAt)}
          />

          <DetailItem
            icon={<FileText size={18} />}
            label="Notes"
            value={transfer.notes || "No notes added"}
          />
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/money-transfers"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          All Transfers
        </Link>

        <Link
          to="/bank-transactions"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          View Bank Transactions
        </Link>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        This page displays locally saved transfer information. It does not verify a real bank transfer or move money between bank accounts.
      </p>
    </div>
  );
}

function AccountPanel({
  label,
  account,
  fallbackName,
  fallbackId,
  type,
}) {
  const isSource = type === "from";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-3 ${
            isSource
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <Wallet size={22} />
        </div>

        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <h3 className="mt-1 font-semibold">
            {account?.accountName ||
              fallbackName ||
              "Account unavailable"}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Bank</span>
          <span className="text-right font-medium">
            {account?.bankName || "Not available"}
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Account type</span>
          <span className="text-right font-medium">
            {account?.accountType || "Not available"}
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Account ID</span>
          <span className="break-all text-right font-medium">
            {account?.id || fallbackId || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
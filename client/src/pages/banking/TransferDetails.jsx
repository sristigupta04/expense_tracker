
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
  Building2,
  ShieldCheck,
} from "lucide-react";

const TRANSFERS_KEY = "expenseTrackerTransfers";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";

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

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

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

  // Transfer Not Found
  if (!transfer) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ArrowLeftRight size={30} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Transfer Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ye transfer record available nahi hai. Ho sakta hai ise delete
              kar diya gaya ho.
            </p>

            <Link
              to="/money-transfers"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowLeft size={17} />
              Back to Transfers
            </Link>
          </section>
        </div>
      </main>
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

  const normalizedStatus = status.toLowerCase();

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      description: "This transfer is marked as completed in your tracker.",
    },
    pending: {
      icon: Clock,
      className: "border-amber-200 bg-amber-50 text-amber-700",
      description: "This transfer is marked as pending in your tracker.",
    },
    failed: {
      icon: XCircle,
      className: "border-rose-200 bg-rose-50 text-rose-700",
      description: "This transfer is marked as failed in your tracker.",
    },
  };

  const statusInfo =
    statusConfig[normalizedStatus] || statusConfig.pending;

  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <header>
          <Link
            to="/money-transfers"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
          >
            <ArrowLeft size={17} />
            Back to Money Transfers
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Banking / Transfers / Details
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Transfer Details
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View the complete information for this transfer record.
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusInfo.className}`}
            >
              <StatusIcon size={18} />
              {status}
            </span>
          </div>
        </header>

        {/* Amount Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

          <div className="relative">
            <div className="flex items-center gap-3 text-blue-100">
              <div className="rounded-xl bg-white/10 p-3">
                <ArrowLeftRight size={24} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Transfer Amount
                </p>

                <p className="mt-1 text-xs text-blue-200">
                  Reference: {transfer.reference || "Not provided"}
                </p>
              </div>
            </div>

            <h2 className="mt-7 break-words text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatCurrency(transfer.amount, currency)}
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100">
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
          </div>
        </section>

        {/* Transfer Route */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
              <ArrowLeftRight size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Transfer Route
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Source and destination accounts
              </p>
            </div>
          </div>

          <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <AccountPanel
              label="From Account"
              account={fromAccount}
              fallbackName={transfer.fromAccountName}
              fallbackId={transfer.fromAccountId}
              type="from"
            />

            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-800">
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

        {/* Transfer Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Transfer Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Complete record information
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
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

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/money-transfers"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft size={17} />
            All Transfers
          </Link>

          <Link
            to="/bank-transactions"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Wallet size={17} />
            View Bank Transactions
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-xs leading-5 text-slate-600">
            This page displays locally saved transfer information. It does
            not verify a real bank transfer or move money between bank
            accounts.
          </p>
        </div>
      </div>
    </main>
  );
}

/* Account Panel */
function AccountPanel({
  label,
  account,
  fallbackName,
  fallbackId,
  type,
}) {
  const isSource = type === "from";

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-blue-200">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isSource
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {account?.bankName ? (
            <Building2 size={22} />
          ) : (
            <Wallet size={22} />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <h3 className="mt-1 break-words font-bold text-slate-900">
            {account?.accountName ||
              fallbackName ||
              "Account unavailable"}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
        <AccountDetail
          label="Bank"
          value={account?.bankName || "Not available"}
        />

        <AccountDetail
          label="Account type"
          value={account?.accountType || "Not available"}
        />

        <AccountDetail
          label="Account ID"
          value={account?.id || fallbackId || "—"}
        />
      </div>
    </div>
  );
}

/* Account Detail Row */
function AccountDetail({ label, value }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>

      <span className="break-all text-right font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

/* Information Detail */
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

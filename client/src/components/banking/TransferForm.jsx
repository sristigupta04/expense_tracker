import { useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  Wallet,
  CalendarDays,
  IndianRupee,
  Building2,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ArrowLeftRight,
  ShieldCheck,
} from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const defaultValues = {
  fromAccountId: "",
  toAccountId: "",
  amount: "",
  transferDate: today,
  transferMethod: "Bank Transfer",
  referenceNumber: "",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "text-sm font-semibold text-slate-700";

export default function TransferForm({
  accounts = [],
  initialData = {},
  onSubmit,
  submitLabel = "Transfer Money",
  loading = false,
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const fromAccount = accounts.find(
    (account) => String(account.id) === String(formData.fromAccountId)
  );

  const toAccount = accounts.find(
    (account) => String(account.id) === String(formData.toAccountId)
  );

  const amount = Number(formData.amount || 0);
  const fromBalance = Number(
    fromAccount?.currentBalance ?? fromAccount?.openingBalance ?? 0
  );

  const fromCurrency = fromAccount?.currency || "INR";
  const toCurrency = toAccount?.currency || "INR";
  const sameCurrency = fromCurrency === toCurrency;

  const formatCurrency = (value, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(value || 0));
    } catch {
      return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }
  };

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.fromAccountId) {
      nextErrors.fromAccountId = "Please select the source account.";
    }

    if (!formData.toAccountId) {
      nextErrors.toAccountId = "Please select the destination account.";
    }

    if (
      formData.fromAccountId &&
      formData.toAccountId &&
      String(formData.fromAccountId) === String(formData.toAccountId)
    ) {
      nextErrors.toAccountId =
        "Source and destination accounts must be different.";
    }

    if (
      formData.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      nextErrors.amount = "Enter a transfer amount greater than zero.";
    } else if (fromAccount && amount > fromBalance) {
      nextErrors.amount = "Insufficient balance in the source account.";
    }

    if (!formData.transferDate) {
      nextErrors.transferDate = "Transfer date is required.";
    } else if (formData.transferDate > today) {
      nextErrors.transferDate = "Transfer date cannot be in the future.";
    }

    if (fromAccount && toAccount && !sameCurrency) {
      nextErrors.currency =
        "Both accounts must use the same currency for this transfer.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      amount,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      fromAccountName: fromAccount?.accountName || fromAccount?.bankName || "",
      toAccountName: toAccount?.accountName || toAccount?.bankName || "",
      currency: fromCurrency,
      referenceNumber: formData.referenceNumber.trim(),
      notes: formData.notes.trim(),
      status: "Completed",
    };

    onSubmit?.(payload);
  };

  const resetForm = () => {
    setFormData({
      ...defaultValues,
      fromAccountId: "",
      toAccountId: "",
    });
    setErrors({});
  };

  const swapAccounts = () => {
    setFormData((previous) => ({
      ...previous,
      fromAccountId: previous.toAccountId,
      toAccountId: previous.fromAccountId,
    }));

    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Account selection */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ArrowLeftRight size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Transfer Accounts</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose where the money comes from and where it goes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
          {/* Source account */}
          <div>
            <label htmlFor="fromAccountId" className={labelClass}>
              From Account <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Building2
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="fromAccountId"
                value={formData.fromAccountId}
                onChange={(event) =>
                  updateField("fromAccountId", event.target.value)
                }
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.fromAccountId)}
              >
                <option value="">Select source account</option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={String(account.id)}
                    disabled={
                      String(account.id) === String(formData.toAccountId)
                    }
                  >
                    {account.accountName || account.bankName || "Bank Account"}
                    {account.accountNumber
                      ? ` (••${String(account.accountNumber).slice(-4)})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {errors.fromAccountId && (
              <ErrorMessage message={errors.fromAccountId} />
            )}

            {fromAccount && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Available balance
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(fromBalance, fromCurrency)}
                </p>
              </div>
            )}
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center md:pt-9">
            <button
              type="button"
              onClick={swapAccounts}
              disabled={!formData.fromAccountId && !formData.toAccountId}
              aria-label="Swap transfer accounts"
              title="Swap accounts"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDownUp size={19} />
            </button>
          </div>

          {/* Destination account */}
          <div>
            <label htmlFor="toAccountId" className={labelClass}>
              To Account <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Wallet
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="toAccountId"
                value={formData.toAccountId}
                onChange={(event) =>
                  updateField("toAccountId", event.target.value)
                }
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.toAccountId)}
              >
                <option value="">Select destination account</option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={String(account.id)}
                    disabled={
                      String(account.id) === String(formData.fromAccountId)
                    }
                  >
                    {account.accountName || account.bankName || "Bank Account"}
                    {account.accountNumber
                      ? ` (••${String(account.accountNumber).slice(-4)})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {errors.toAccountId && (
              <ErrorMessage message={errors.toAccountId} />
            )}

            {toAccount && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Destination account
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                  {toAccount.accountName || toAccount.bankName}
                </p>
              </div>
            )}
          </div>
        </div>

        {errors.currency && (
          <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 sm:mx-6">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {errors.currency}
          </div>
        )}
      </section>

      {/* Transfer details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <IndianRupee size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Transfer Details</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enter the amount and transfer information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="transferAmount" className={labelClass}>
              Transfer Amount <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <IndianRupee
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="transferAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="Enter amount"
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.amount)}
              />
            </div>

            {errors.amount && <ErrorMessage message={errors.amount} />}
          </div>

          <div>
            <label htmlFor="transferDate" className={labelClass}>
              Transfer Date <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="transferDate"
                type="date"
                max={today}
                value={formData.transferDate}
                onChange={(event) =>
                  updateField("transferDate", event.target.value)
                }
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.transferDate)}
              />
            </div>

            {errors.transferDate && (
              <ErrorMessage message={errors.transferDate} />
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="transferMethod" className={labelClass}>
              Transfer Method
            </label>

            <select
              id="transferMethod"
              value={formData.transferMethod}
              onChange={(event) =>
                updateField("transferMethod", event.target.value)
              }
              className={inputClass}
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
              <option value="Internal Transfer">Internal Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="referenceNumber" className={labelClass}>
              Reference Number
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              id="referenceNumber"
              type="text"
              maxLength={100}
              value={formData.referenceNumber}
              onChange={(event) =>
                updateField("referenceNumber", event.target.value)
              }
              placeholder="Enter transfer reference"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Transfer summary */}
      {fromAccount && toAccount && amount > 0 && sameCurrency && (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={19} className="text-blue-700" />
            <h3 className="font-bold text-slate-900">Transfer Summary</h3>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">From</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                {fromAccount.accountName || fromAccount.bankName}
              </p>
              <p className="mt-2 text-lg font-bold text-rose-600">
                −{formatCurrency(amount, fromCurrency)}
              </p>
            </div>

            <ArrowRight
              size={22}
              className="mx-auto shrink-0 text-blue-700 sm:mx-0"
            />

            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">To</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                {toAccount.accountName || toAccount.bankName}
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-700">
                +{formatCurrency(amount, toCurrency)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            This is a transfer preview. Account balances will change only when
            your submit handler saves the transfer successfully.
          </p>
        </section>
      )}

      {/* Notes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Additional Notes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add an optional note about this transfer.
            </p>
          </div>
        </div>

        <label htmlFor="transferNotes" className={labelClass}>
          Notes
        </label>

        <textarea
          id="transferNotes"
          rows={3}
          maxLength={500}
          value={formData.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="e.g. Moving monthly savings to another account"
          className={`${inputClass} resize-y`}
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {formData.notes.length}/500
        </p>
      </section>

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-slate-600" />
        <p className="text-sm leading-6 text-slate-600">
          This form records a transfer in your expense tracker. It does not
          initiate a real bank transfer or move money between bank accounts.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <button
          type="submit"
          disabled={loading || accounts.length < 2}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Processing...
            </>
          ) : (
            <>
              <ArrowLeftRight size={17} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}
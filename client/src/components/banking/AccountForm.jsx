import { useState } from "react";
import {
  Wallet,
  Building2,
  CreditCard,
  IndianRupee,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

const initialFormData = {
  accountName: "",
  bankName: "",
  accountType: "Savings",
  accountNumber: "",
  openingBalance: "0",
  currency: "INR",
  status: "Active",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "text-sm font-semibold text-slate-700";

export default function AccountForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save Account",
  loading = false,
}) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    ...initialData,
    openingBalance:
      initialData.openingBalance !== undefined
        ? String(initialData.openingBalance)
        : initialFormData.openingBalance,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required.";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required.";
    }

    if (
      formData.accountNumber &&
      !/^\d{4,20}$/.test(formData.accountNumber.replace(/\s/g, ""))
    ) {
      newErrors.accountNumber =
        "Enter 4–20 digits, without letters or symbols.";
    }

    if (
      formData.openingBalance.trim() === "" ||
      !Number.isFinite(Number(formData.openingBalance)) ||
      Number(formData.openingBalance) < 0
    ) {
      newErrors.openingBalance =
        "Enter a valid balance greater than or equal to zero.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...formData,
      accountName: formData.accountName.trim(),
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber.replace(/\s/g, ""),
      openingBalance: Number(formData.openingBalance),
    };

    onSubmit?.(payload);
  };

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      ...initialData,
      openingBalance:
        initialData.openingBalance !== undefined
          ? String(initialData.openingBalance)
          : "0",
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Account information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Wallet size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Account Information
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enter your bank account details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="accountName" className={labelClass}>
              Account Name <span className="text-red-500">*</span>
            </label>

            <input
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="e.g. Personal Savings"
              className={inputClass}
              aria-invalid={Boolean(errors.accountName)}
            />

            {errors.accountName && (
              <ErrorMessage message={errors.accountName} />
            )}
          </div>

          <div>
            <label htmlFor="bankName" className={labelClass}>
              Bank Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Building2
                size={17}
                className="absolute left-3 top-[25px] text-slate-400"
              />
              <input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.bankName)}
              />
            </div>

            {errors.bankName && (
              <ErrorMessage message={errors.bankName} />
            )}
          </div>

          <div>
            <label htmlFor="accountType" className={labelClass}>
              Account Type
            </label>

            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Savings">Savings Account</option>
              <option value="Current">Current Account</option>
              <option value="Salary">Salary Account</option>
              <option value="Business">Business Account</option>
              <option value="Cash">Cash Account</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="accountNumber" className={labelClass}>
              Account Number
            </label>

            <div className="relative">
              <CreditCard
                size={17}
                className="absolute left-3 top-[25px] text-slate-400"
              />
              <input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                inputMode="numeric"
                autoComplete="off"
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.accountNumber)}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Only enter details you need to identify the account.
            </p>

            {errors.accountNumber && (
              <ErrorMessage message={errors.accountNumber} />
            )}
          </div>
        </div>
      </section>

      {/* Balance and preferences */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <IndianRupee size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Balance & Preferences
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Set the opening balance, currency and account status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="openingBalance" className={labelClass}>
              Opening Balance <span className="text-red-500">*</span>
            </label>

            <input
              id="openingBalance"
              name="openingBalance"
              type="number"
              min="0"
              step="0.01"
              value={formData.openingBalance}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
              aria-invalid={Boolean(errors.openingBalance)}
            />

            {errors.openingBalance && (
              <ErrorMessage message={errors.openingBalance} />
            )}
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Currency
            </label>

            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="status" className={labelClass}>
              Account Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Additional Notes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add an optional description for your reference.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <label htmlFor="notes" className={labelClass}>
            Notes <span className="font-normal text-slate-400">(Optional)</span>
          </label>

          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Add a note about this account..."
            className={`${inputClass} resize-y`}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {formData.notes.length}/500
          </p>
        </div>
      </section>

      {/* Form actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {loading ? "Saving..." : submitLabel}
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
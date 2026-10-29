import { useState } from "react";
import {
  CreditCard,
  Building2,
  UserRound,
  Wallet,
  CalendarDays,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const defaultValues = {
  cardName: "",
  bankName: "",
  cardBrand: "Visa",
  cardNumber: "",
  cardHolder: "",
  creditLimit: "0",
  availableLimit: "",
  currency: "INR",
  billingDate: "",
  dueDate: "",
  status: "Active",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "text-sm font-semibold text-slate-700";

export default function CreditCardForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save Credit Card",
  loading = false,
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialData,
    cardNumber: initialData.cardNumber
      ? String(initialData.cardNumber)
      : "",
    creditLimit:
      initialData.creditLimit !== undefined
        ? String(initialData.creditLimit)
        : "0",
    availableLimit:
      initialData.availableLimit !== undefined
        ? String(initialData.availableLimit)
        : "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const next = { ...previous, [name]: value };

      // Keep available credit in sync with the limit and outstanding balance
      // when availableLimit is not manually maintained.
      if (name === "creditLimit" && previous.availableLimit === "") {
        next.availableLimit = value;
      }

      return next;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.cardName.trim()) {
      nextErrors.cardName = "Card name is required.";
    }

    if (!formData.bankName.trim()) {
      nextErrors.bankName = "Bank name is required.";
    }

    if (
      formData.cardNumber &&
      !/^\d{4,19}$/.test(formData.cardNumber.replace(/\s/g, ""))
    ) {
      nextErrors.cardNumber =
        "Enter a valid card number containing 4–19 digits.";
    }

    if (
      formData.creditLimit.trim() === "" ||
      !Number.isFinite(Number(formData.creditLimit)) ||
      Number(formData.creditLimit) < 0
    ) {
      nextErrors.creditLimit = "Enter a valid credit limit.";
    }

    if (
      formData.availableLimit !== "" &&
      (!Number.isFinite(Number(formData.availableLimit)) ||
        Number(formData.availableLimit) < 0 ||
        Number(formData.availableLimit) > Number(formData.creditLimit))
    ) {
      nextErrors.availableLimit =
        "Available limit must be between zero and the credit limit.";
    }

    if (
      formData.billingDate &&
      formData.dueDate &&
      Number(formData.dueDate) < Number(formData.billingDate)
    ) {
      nextErrors.dueDate =
        "Due date must be on or after the billing date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      cardName: formData.cardName.trim(),
      bankName: formData.bankName.trim(),
      cardHolder: formData.cardHolder.trim(),
      // Store only the last four digits; do not retain the full card number.
      cardNumber: formData.cardNumber
        ? formData.cardNumber.replace(/\s/g, "").slice(-4)
        : "",
      creditLimit: Number(formData.creditLimit),
      availableLimit:
        formData.availableLimit === ""
          ? Number(formData.creditLimit)
          : Number(formData.availableLimit),
    };

    onSubmit?.(payload);
  };

  const handleReset = () => {
    setFormData({
      ...defaultValues,
      ...initialData,
      cardNumber: initialData.cardNumber
        ? String(initialData.cardNumber)
        : "",
      creditLimit:
        initialData.creditLimit !== undefined
          ? String(initialData.creditLimit)
          : "0",
      availableLimit:
        initialData.availableLimit !== undefined
          ? String(initialData.availableLimit)
          : "",
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Card details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CreditCard size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Card Information</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enter the basic details of your credit card.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="cardName" className={labelClass}>
              Card Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="e.g. Personal Credit Card"
              className={inputClass}
              aria-invalid={Boolean(errors.cardName)}
            />
            {errors.cardName && <ErrorMessage message={errors.cardName} />}
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
                placeholder="e.g. HDFC Bank"
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.bankName)}
              />
            </div>
            {errors.bankName && <ErrorMessage message={errors.bankName} />}
          </div>

          <div>
            <label htmlFor="cardBrand" className={labelClass}>
              Card Network
            </label>
            <select
              id="cardBrand"
              name="cardBrand"
              value={formData.cardBrand}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="RuPay">RuPay</option>
              <option value="American Express">American Express</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="cardHolder" className={labelClass}>
              Card Holder Name
            </label>
            <div className="relative">
              <UserRound
                size={17}
                className="absolute left-3 top-[25px] text-slate-400"
              />
              <input
                id="cardHolder"
                name="cardHolder"
                value={formData.cardHolder}
                onChange={handleChange}
                placeholder="Name on card"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cardNumber" className={labelClass}>
              Card Number (Optional)
            </label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="Enter digits only"
              maxLength={19}
              className={inputClass}
              aria-invalid={Boolean(errors.cardNumber)}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Only the last four digits are submitted for identification.
              Never enter your CVV, PIN or OTP.
            </p>
            {errors.cardNumber && (
              <ErrorMessage message={errors.cardNumber} />
            )}
          </div>
        </div>
      </section>

      {/* Credit limit */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Wallet size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Credit Limit</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Configure your card limit and available credit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="creditLimit" className={labelClass}>
              Total Credit Limit <span className="text-red-500">*</span>
            </label>
            <input
              id="creditLimit"
              name="creditLimit"
              type="number"
              min="0"
              step="0.01"
              value={formData.creditLimit}
              onChange={handleChange}
              placeholder="e.g. 100000"
              className={inputClass}
              aria-invalid={Boolean(errors.creditLimit)}
            />
            {errors.creditLimit && (
              <ErrorMessage message={errors.creditLimit} />
            )}
          </div>

          <div>
            <label htmlFor="availableLimit" className={labelClass}>
              Available Credit
            </label>
            <input
              id="availableLimit"
              name="availableLimit"
              type="number"
              min="0"
              step="0.01"
              value={formData.availableLimit}
              onChange={handleChange}
              placeholder="Same as credit limit"
              className={inputClass}
              aria-invalid={Boolean(errors.availableLimit)}
            />
            {errors.availableLimit && (
              <ErrorMessage message={errors.availableLimit} />
            )}
          </div>

          <div className="sm:col-span-2">
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
        </div>
      </section>

      {/* Billing details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <CalendarDays size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Billing Information</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Keep track of your statement and payment dates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="billingDate" className={labelClass}>
              Billing Day
            </label>
            <select
              id="billingDate"
              name="billingDate"
              value={formData.billingDate}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select billing day</option>
              {Array.from({ length: 31 }, (_, index) => {
                const day = String(index + 1);
                return (
                  <option key={day} value={day}>
                    {day}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className={labelClass}>
              Payment Due Day
            </label>
            <select
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select due day</option>
              {Array.from({ length: 31 }, (_, index) => {
                const day = String(index + 1);
                return (
                  <option key={day} value={day}>
                    {day}
                  </option>
                );
              })}
            </select>
            {errors.dueDate && <ErrorMessage message={errors.dueDate} />}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="status" className={labelClass}>
              Card Status
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
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Additional Notes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add optional information for your records.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add a note..."
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {formData.notes.length}/500
          </p>
        </div>
      </section>

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-700" />
        <p className="text-sm leading-6 text-blue-900">
          For your security, do not store your full card number, CVV, PIN or
          OTP in this expense tracker. Use a card nickname and last four
          digits instead.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
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
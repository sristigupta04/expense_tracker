import { useState } from "react";
import {
  CreditCard,
  Wallet,
  CalendarDays,
  IndianRupee,
  Landmark,
  Banknote,
  Smartphone,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const defaultValues = {
  cardId: "",
  amount: "",
  paymentDate: today,
  paymentMethod: "Bank Transfer",
  referenceNumber: "",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "text-sm font-semibold text-slate-700";

export default function CreditCardPaymentForm({
  cards = [],
  initialData = {},
  onSubmit,
  submitLabel = "Record Payment",
  loading = false,
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const selectedCard = cards.find(
    (card) => String(card.id) === String(formData.cardId)
  );

  const creditLimit = Number(selectedCard?.creditLimit || 0);

  const availableLimit =
    selectedCard?.availableLimit !== undefined
      ? Number(selectedCard.availableLimit)
      : Math.max(
          0,
          creditLimit - Number(selectedCard?.outstandingBalance || 0)
        );

  const outstandingBalance = Math.max(
    0,
    creditLimit - availableLimit
  );

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

  const formatCurrency = (amount, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.cardId) {
      nextErrors.cardId = "Please select a credit card.";
    }

    if (
      formData.amount === "" ||
      !Number.isFinite(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      nextErrors.amount = "Enter a payment amount greater than zero.";
    } else if (
      selectedCard &&
      Number(formData.amount) > outstandingBalance
    ) {
      nextErrors.amount =
        "Payment cannot exceed the outstanding balance.";
    }

    if (!formData.paymentDate) {
      nextErrors.paymentDate = "Payment date is required.";
    } else if (formData.paymentDate > today) {
      nextErrors.paymentDate = "Payment date cannot be in the future.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      cardId: formData.cardId,
      cardName: selectedCard?.cardName || selectedCard?.cardHolder || "",
      bankName: selectedCard?.bankName || "",
      currency: selectedCard?.currency || "INR",
      referenceNumber: formData.referenceNumber.trim(),
      notes: formData.notes.trim(),
    };

    onSubmit?.(payload);
  };

  const resetForm = () => {
    setFormData({
      ...defaultValues,
      cardId: cards.length === 1 ? String(cards[0].id) : "",
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Card selection */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CreditCard size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Select Credit Card</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose the card for which you made a payment.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <label htmlFor="payment-card" className={labelClass}>
            Credit Card <span className="text-red-500">*</span>
          </label>

          <select
            id="payment-card"
            value={formData.cardId}
            onChange={(event) => updateField("cardId", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.cardId)}
          >
            <option value="">Select a card</option>

            {cards.map((card) => (
              <option key={card.id} value={String(card.id)}>
                {card.cardName || "Credit Card"} — {card.bankName || "Bank"}
              </option>
            ))}
          </select>

          {errors.cardId && <ErrorMessage message={errors.cardId} />}

          {cards.length === 0 && (
            <p className="mt-2 text-sm text-amber-700">
              No credit cards found. Add a credit card before recording a payment.
            </p>
          )}

          {selectedCard && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard
                label="Outstanding Balance"
                value={formatCurrency(
                  outstandingBalance,
                  selectedCard.currency
                )}
                icon={Wallet}
              />

              <InfoCard
                label="Available Credit"
                value={formatCurrency(
                  availableLimit,
                  selectedCard.currency
                )}
                icon={CreditCard}
              />
            </div>
          )}
        </div>
      </section>

      {/* Payment details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <IndianRupee size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Payment Details</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enter the amount and payment information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="payment-amount" className={labelClass}>
              Payment Amount <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <IndianRupee
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="payment-amount"
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
            <label htmlFor="payment-date" className={labelClass}>
              Payment Date <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="payment-date"
                type="date"
                max={today}
                value={formData.paymentDate}
                onChange={(event) =>
                  updateField("paymentDate", event.target.value)
                }
                className={`${inputClass} pl-10`}
                aria-invalid={Boolean(errors.paymentDate)}
              />
            </div>

            {errors.paymentDate && (
              <ErrorMessage message={errors.paymentDate} />
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="payment-method" className={labelClass}>
              Payment Method
            </label>

            <div className="relative">
              <Landmark
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="payment-method"
                value={formData.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value)
                }
                className={`${inputClass} pl-10`}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Auto Debit">Auto Debit</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="payment-reference" className={labelClass}>
              Reference Number
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              id="payment-reference"
              type="text"
              value={formData.referenceNumber}
              onChange={(event) =>
                updateField("referenceNumber", event.target.value)
              }
              placeholder="Enter transaction reference"
              className={inputClass}
              maxLength={100}
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Payment Notes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add an optional note for your records.
            </p>
          </div>
        </div>

        <label htmlFor="payment-notes" className={labelClass}>
          Notes
        </label>

        <textarea
          id="payment-notes"
          rows={3}
          maxLength={500}
          value={formData.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="e.g. Monthly credit card bill payment"
          className={`${inputClass} resize-y`}
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {formData.notes.length}/500
        </p>
      </section>

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-700" />
        <p className="text-sm leading-6 text-blue-900">
          Record only the payment details needed for expense tracking. Never
          enter your card PIN, CVV or OTP.
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
          disabled={loading || cards.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 break-words text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
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
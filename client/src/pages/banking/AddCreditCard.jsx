
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerCreditCards";

const initialForm = {
  cardName: "",
  bankName: "",
  lastFourDigits: "",
  cardType: "Credit",
  creditLimit: "",
  outstandingAmount: "0",
  statementDate: "",
  dueDate: "",
  minimumDue: "0",
  currency: "INR",
  status: "Active",
};

function readCards() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  } catch {
    return `${currency} ${toNumber(amount).toLocaleString("en-IN")}`;
  }
}

function Field({ label, name, error, required, children }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddCreditCard() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showDigits, setShowDigits] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const creditLimit = toNumber(form.creditLimit);
  const outstanding = toNumber(form.outstandingAmount);
  const availableLimit = Math.max(0, creditLimit - outstanding);

  const utilization = useMemo(() => {
    if (creditLimit <= 0) return 0;
    return Math.min(100, (outstanding / creditLimit) * 100);
  }, [creditLimit, outstanding]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));

    setMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    const limit = Number(form.creditLimit);
    const currentOutstanding = Number(form.outstandingAmount);
    const minimumDue = Number(form.minimumDue);

    if (!form.cardName.trim()) {
      nextErrors.cardName = "Card nickname is required.";
    }

    if (!form.bankName.trim()) {
      nextErrors.bankName = "Bank name is required.";
    }

    if (!/^\d{4}$/.test(form.lastFourDigits)) {
      nextErrors.lastFourDigits = "Enter exactly four digits.";
    }

    if (
      form.creditLimit === "" ||
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      nextErrors.creditLimit = "Credit limit must be greater than zero.";
    }

    if (
      form.outstandingAmount === "" ||
      !Number.isFinite(currentOutstanding) ||
      currentOutstanding < 0
    ) {
      nextErrors.outstandingAmount = "Enter a valid outstanding amount.";
    } else if (
      Number.isFinite(limit) &&
      limit > 0 &&
      currentOutstanding > limit
    ) {
      nextErrors.outstandingAmount =
        "Outstanding amount cannot exceed the credit limit.";
    }

    if (
      form.minimumDue === "" ||
      !Number.isFinite(minimumDue) ||
      minimumDue < 0
    ) {
      nextErrors.minimumDue = "Enter a valid minimum due.";
    } else if (
      Number.isFinite(currentOutstanding) &&
      minimumDue > currentOutstanding
    ) {
      nextErrors.minimumDue =
        "Minimum due cannot exceed the outstanding amount.";
    }

    if (!form.statementDate) {
      nextErrors.statementDate = "Statement date is required.";
    }

    if (!form.dueDate) {
      nextErrors.dueDate = "Payment due date is required.";
    } else if (
      form.statementDate &&
      form.dueDate < form.statementDate
    ) {
      nextErrors.dueDate =
        "Due date must be on or after the statement date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!validate()) return;

    setSaving(true);

    try {
      const saved = readCards();

      const duplicate = saved.some(
        (card) =>
          String(card.bankName || "").trim().toLowerCase() ===
            form.bankName.trim().toLowerCase() &&
          String(card.lastFourDigits || "") === form.lastFourDigits
      );

      if (duplicate) {
        setErrors({
          lastFourDigits:
            "A card with this bank and last four digits already exists.",
        });
        setSaving(false);
        return;
      }

      const card = {
        id:
          globalThis.crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...form,
        cardName: form.cardName.trim(),
        bankName: form.bankName.trim(),
        lastFourDigits: form.lastFourDigits,
        creditLimit,
        outstandingAmount: outstanding,
        availableLimit,
        minimumDue: toNumber(form.minimumDue),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...saved, card])
      );

      setForm(initialForm);
      setErrors({});
      setMessage("Credit card saved successfully.");
    } catch (error) {
      console.error("Could not save credit card:", error);

      setErrors({
        submit: "Unable to save. Check browser storage and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0D21A1]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
            Banking / Credit Cards
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Add Credit Card
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your credit limit, outstanding balance and payment dates.
          </p>
        </header>

        {/* Live Card Preview */}
        <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-blue-100">
                {form.bankName || "Bank name"}
              </p>

              <h2 className="mt-2 break-words text-xl font-bold">
                {form.cardName || "Your Credit Card"}
              </h2>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-lg tracking-[0.2em]">
                  {showDigits && form.lastFourDigits
                    ? `•••• •••• •••• ${form.lastFourDigits}`
                    : `•••• •••• •••• ${form.lastFourDigits || "••••"}`}
                </span>

                <button
                  type="button"
                  onClick={() => setShowDigits((value) => !value)}
                  aria-label={showDigits ? "Hide card digits" : "Show card digits"}
                  className="rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10"
                >
                  {showDigits ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="shrink-0 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold">
              {form.cardType}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-blue-100">Credit limit</p>
              <p className="mt-1 break-words text-xl font-bold">
                {formatMoney(form.creditLimit, form.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-blue-100">Available limit</p>
              <p className="mt-1 break-words text-xl font-bold">
                {formatMoney(availableLimit, form.currency)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-blue-100">
              <span>Credit utilization</span>
              <span>{utilization.toFixed(1)}%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {message && (
            <div
              role="status"
              className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2">
                <Check size={18} />
                {message}
              </div>

              <Link
                to="/credit-cards"
                className="font-semibold underline"
              >
                View cards
              </Link>
            </div>
          )}

          {errors.submit && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {errors.submit}
            </p>
          )}

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
              <CreditCard size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Card Information
              </h2>
              <p className="text-xs text-slate-500">
                Enter your card details below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Card nickname"
              name="cardName"
              required
              error={errors.cardName}
            >
              <input
                id="cardName"
                name="cardName"
                value={form.cardName}
                onChange={updateField}
                placeholder="e.g. My Shopping Card"
                className={inputClass}
                maxLength={50}
              />
            </Field>

            <Field
              label="Bank / Issuer"
              name="bankName"
              required
              error={errors.bankName}
            >
              <input
                id="bankName"
                name="bankName"
                value={form.bankName}
                onChange={updateField}
                placeholder="e.g. HDFC Bank"
                className={inputClass}
                maxLength={60}
              />
            </Field>

            <Field
              label="Last 4 digits"
              name="lastFourDigits"
              required
              error={errors.lastFourDigits}
            >
              <input
                id="lastFourDigits"
                name="lastFourDigits"
                value={form.lastFourDigits}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    lastFourDigits: event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4),
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    lastFourDigits: "",
                    submit: "",
                  }));
                  setMessage("");
                }}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="1234"
                className={inputClass}
              />
            </Field>

            <Field label="Card type" name="cardType">
              <select
                id="cardType"
                name="cardType"
                value={form.cardType}
                onChange={updateField}
                className={inputClass}
              >
                <option value="Credit">Credit Card</option>
              </select>
            </Field>

            <Field
              label="Total credit limit"
              name="creditLimit"
              required
              error={errors.creditLimit}
            >
              <input
                id="creditLimit"
                name="creditLimit"
                type="number"
                min="0.01"
                step="0.01"
                value={form.creditLimit}
                onChange={updateField}
                placeholder="50000"
                className={inputClass}
              />
            </Field>

            <Field
              label="Current outstanding"
              name="outstandingAmount"
              required
              error={errors.outstandingAmount}
            >
              <input
                id="outstandingAmount"
                name="outstandingAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.outstandingAmount}
                onChange={updateField}
                placeholder="0"
                className={inputClass}
              />
            </Field>

            <Field
              label="Statement date"
              name="statementDate"
              required
              error={errors.statementDate}
            >
              <input
                id="statementDate"
                name="statementDate"
                type="date"
                value={form.statementDate}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field
              label="Payment due date"
              name="dueDate"
              required
              error={errors.dueDate}
            >
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field
              label="Minimum amount due"
              name="minimumDue"
              required
              error={errors.minimumDue}
            >
              <input
                id="minimumDue"
                name="minimumDue"
                type="number"
                min="0"
                step="0.01"
                value={form.minimumDue}
                onChange={updateField}
                placeholder="0"
                className={inputClass}
              />
            </Field>

            <Field label="Currency" name="currency">
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={updateField}
                className={inputClass}
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </Field>

            <Field label="Card status" name="status">
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateField}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </Field>
          </div>

          {/* Security Note */}
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <LockKeyhole
              size={19}
              className="mt-0.5 shrink-0 text-[#0D21A1]"
            />

            <div>
              <p className="text-sm font-semibold text-blue-950">
                Keep your card information safe
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-900/75">
                Enter only the last four digits. Never enter your full card
                number, CVV, PIN or OTP.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Save Credit Card
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Demo mode: card details are saved in this browser's local storage.
          No live bank connection or server storage is configured.
        </div>
      </div>
    </main>
  );
}

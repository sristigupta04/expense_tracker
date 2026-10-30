
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Save,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerCreditCards";

const initialForm = {
  cardName: "",
  bankName: "",
  lastFourDigits: "",
  cardType: "Visa",
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function EditCreditCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const cards = readCards();

    const card = cards.find(
      (item) => String(item.id) === String(id)
    );

    if (!card) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setForm({
      cardName: card.cardName || "",
      bankName: card.bankName || "",
      lastFourDigits: String(card.lastFourDigits || ""),
      cardType: card.cardType || "Visa",
      creditLimit: String(card.creditLimit ?? ""),
      outstandingAmount: String(card.outstandingAmount ?? 0),
      statementDate: String(card.statementDate || "").slice(0, 10),
      dueDate: String(card.dueDate || "").slice(0, 10),
      minimumDue: String(card.minimumDue ?? 0),
      currency: card.currency || "INR",
      status: card.status || "Active",
    });

    setLoading(false);
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (saving) return;

    const cardName = form.cardName.trim();
    const bankName = form.bankName.trim();
    const lastFourDigits = form.lastFourDigits.trim();

    if (!cardName || !bankName || !/^\d{4}$/.test(lastFourDigits)) {
      setError(
        "Enter card name, bank name and exactly 4 card digits."
      );
      return;
    }

    const creditLimit = Number(form.creditLimit);
    const outstandingAmount = Number(form.outstandingAmount);
    const minimumDue = Number(form.minimumDue);

    if (
      form.creditLimit.trim() === "" ||
      !Number.isFinite(creditLimit) ||
      creditLimit <= 0
    ) {
      setError("Credit limit must be greater than zero.");
      return;
    }

    if (
      form.outstandingAmount.trim() === "" ||
      !Number.isFinite(outstandingAmount) ||
      outstandingAmount < 0 ||
      outstandingAmount > creditLimit
    ) {
      setError(
        "Outstanding amount must be between zero and the credit limit."
      );
      return;
    }

    if (
      form.minimumDue.trim() === "" ||
      !Number.isFinite(minimumDue) ||
      minimumDue < 0 ||
      minimumDue > outstandingAmount
    ) {
      setError(
        "Minimum due must be between zero and the outstanding amount."
      );
      return;
    }

    if (
      form.statementDate &&
      form.dueDate &&
      form.dueDate < form.statementDate
    ) {
      setError(
        "Payment due date should not be before statement date."
      );
      return;
    }

    const cards = readCards();

    const index = cards.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      setNotFound(true);
      return;
    }

    // Prevent duplicate card records
    const duplicate = cards.some(
      (item, cardIndex) =>
        cardIndex !== index &&
        String(item.lastFourDigits) === lastFourDigits &&
        String(item.bankName || "").trim().toLowerCase() ===
          bankName.toLowerCase()
    );

    if (duplicate) {
      setError(
        "A card with these last four digits already exists for this bank."
      );
      return;
    }

    const existingCard = cards[index];

    const updatedCard = {
      ...existingCard,
      cardName,
      bankName,
      lastFourDigits,
      cardType: form.cardType,
      creditLimit,
      outstandingAmount,
      availableLimit: Math.max(
        creditLimit - outstandingAmount,
        0
      ),
      statementDate: form.statementDate,
      dueDate: form.dueDate,
      minimumDue,
      currency: form.currency,
      status: form.status,
      updatedAt: new Date().toISOString(),
    };

    cards[index] = updatedCard;

    setSaving(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));

      setSuccess("Credit card updated successfully.");

      window.setTimeout(() => {
        navigate(`/credit-cards/${id}`);
      }, 700);
    } catch {
      setError(
        "Could not save changes. Browser storage may be full."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Loading credit card...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <CreditCard size={27} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900">
          Credit card not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This card may have been deleted or is no longer available.
        </p>

        <Link
          to="/credit-cards"
          className="mt-6 inline-flex rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
        >
          Back to Credit Cards
        </Link>
      </div>
    );
  }

  const availableLimit =
    Math.max(
      (Number(form.creditLimit) || 0) -
        (Number(form.outstandingAmount) || 0),
      0
    );

  const utilization =
    Number(form.creditLimit) > 0
      ? Math.min(
          ((Number(form.outstandingAmount) || 0) /
            Number(form.creditLimit)) *
            100,
          100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <header>
          <Link
            to={`/credit-cards/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
          >
            <ArrowLeft size={17} />
            Back to Card Details
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3.5 text-[#0D21A1]">
              <CreditCard size={26} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Banking / Credit Cards
              </p>

              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Edit Credit Card
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update your card information and payment details.
              </p>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Basic Information */}
            <div>
              <SectionHeading
                title="Card Information"
                description="Update your card identity and network details."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Card Nickname *">
                  <input
                    required
                    name="cardName"
                    value={form.cardName}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="e.g. My Credit Card"
                    className={inputClass}
                  />
                </Field>

                <Field label="Bank / Provider *">
                  <input
                    required
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    maxLength={60}
                    placeholder="e.g. HDFC Bank"
                    className={inputClass}
                  />
                </Field>

                <Field label="Last 4 Digits *">
                  <input
                    required
                    name="lastFourDigits"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={form.lastFourDigits}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: "lastFourDigits",
                          value: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        },
                      })
                    }
                    placeholder="1234"
                    className={inputClass}
                  />
                </Field>

                <Field label="Card Network">
                  <select
                    name="cardType"
                    value={form.cardType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">
                      American Express
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Credit Details */}
            <div>
              <SectionHeading
                title="Credit Details"
                description="Manage credit limit and current outstanding amount."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Credit Limit *">
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="creditLimit"
                    value={form.creditLimit}
                    onChange={handleChange}
                    placeholder="Enter credit limit"
                    className={inputClass}
                  />
                </Field>

                <Field label="Outstanding Amount *">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    name="outstandingAmount"
                    value={form.outstandingAmount}
                    onChange={handleChange}
                    placeholder="Enter outstanding amount"
                    className={inputClass}
                  />
                </Field>

                <Field label="Minimum Due">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="minimumDue"
                    value={form.minimumDue}
                    onChange={handleChange}
                    placeholder="Minimum payment"
                    className={inputClass}
                  />
                </Field>

                <Field label="Currency">
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </Field>
              </div>

              {/* Live Credit Utilization */}
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Available Credit Limit
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-[#0D21A1]">
                      {formatCurrency(
                        availableLimit,
                        form.currency
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Credit Utilization
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {utilization.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilization >= 80
                        ? "bg-rose-500"
                        : utilization >= 50
                          ? "bg-amber-500"
                          : "bg-blue-600"
                    }`}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Payment Details */}
            <div>
              <SectionHeading
                title="Payment Details"
                description="Update statement and payment due dates."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Statement Date">
                  <input
                    type="date"
                    name="statementDate"
                    value={form.statementDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Payment Due Date">
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    min={form.statementDate || undefined}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Status */}
            <div>
              <SectionHeading
                title="Card Status"
                description="Manage the current status of this card."
              />

              <div className="mt-5">
                <Field label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <p className="text-xs leading-5 text-slate-600">
                Only the last four digits are stored in this card
                record. Never enter your full card number, CVV or PIN.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={`/credit-cards/${id}`}
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
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


import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Save } from "lucide-react";

const STORAGE_KEY = "expenseTrackerCreditCards";

const initialForm = {
  cardName: "",
  bankName: "",
  lastFourDigits: "",
  cardType: "Visa",
  creditLimit: "",
  outstandingAmount: "",
  statementDate: "",
  dueDate: "",
  minimumDue: "0",
  currency: "INR",
  status: "Active",
};

function readCards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function EditCreditCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cards = readCards();
    const card = cards.find(
      (item) => String(item.id) === String(id)
    );

    if (!card) {
      setError("Credit card not found.");
      setLoading(false);
      return;
    }

    setForm({
      cardName: card.cardName || "",
      bankName: card.bankName || "",
      lastFourDigits: card.lastFourDigits || "",
      cardType: card.cardType || "Visa",
      creditLimit: String(card.creditLimit ?? ""),
      outstandingAmount: String(card.outstandingAmount ?? 0),
      statementDate: String(card.statementDate || ""),
      dueDate: String(card.dueDate || ""),
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.cardName.trim() ||
      !form.bankName.trim() ||
      !/^\d{4}$/.test(form.lastFourDigits)
    ) {
      setError(
        "Enter the card name, bank name and exactly 4 card digits."
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
      minimumDue < 0
    ) {
      setError("Enter a valid minimum payment amount.");
      return;
    }

    if (
      form.statementDate &&
      form.dueDate &&
      form.dueDate < form.statementDate
    ) {
      setError("Payment due date should not be before statement date.");
      return;
    }

    const cards = readCards();
    const index = cards.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      setError("This credit card no longer exists.");
      return;
    }

    const existingCard = cards[index];

    cards[index] = {
      ...existingCard,
      cardName: form.cardName.trim(),
      bankName: form.bankName.trim(),
      lastFourDigits: form.lastFourDigits,
      cardType: form.cardType,
      creditLimit,
      outstandingAmount,
      availableLimit: Math.max(creditLimit - outstandingAmount, 0),
      statementDate: form.statementDate,
      dueDate: form.dueDate,
      minimumDue,
      currency: form.currency,
      status: form.status,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      navigate(`/credit-cards/${id}`);
    } catch {
      setError("Could not save changes. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading credit card...
      </div>
    );
  }

  if (error === "Credit card not found.") {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-xl font-bold">Credit card not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This card may have been deleted.
        </p>
        <Link
          to="/credit-cards"
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-white"
        >
          Back to Credit Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/credit-cards/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Card Details
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <CreditCard size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Credit Card
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Update your card information and payment details.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Card Nickname *">
                <input
                  required
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
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
                  placeholder="e.g. HDFC Bank"
                  className={inputClass}
                />
              </Field>

              <Field label="Last 4 Digits *">
                <input
                  required
                  name="lastFourDigits"
                  value={form.lastFourDigits}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
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
                  <option value="American Express">American Express</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Credit Limit *">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="creditLimit"
                  value={form.creditLimit}
                  onChange={handleChange}
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
                  className={inputClass}
                />
              </Field>

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
                  onChange={handleChange}
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

              <Field label="Card Status">
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

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={`/credit-cards/${id}`}
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function AddCreditCard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  };

  const validate = () => {
    const nextErrors = {};
    const limit = Number(form.creditLimit);
    const outstanding = Number(form.outstandingAmount);
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

    if (form.creditLimit === "" || !Number.isFinite(limit) || limit <= 0) {
      nextErrors.creditLimit = "Credit limit must be greater than zero.";
    }

    if (
      form.outstandingAmount === "" ||
      !Number.isFinite(outstanding) ||
      outstanding < 0
    ) {
      nextErrors.outstandingAmount = "Enter a valid outstanding amount.";
    } else if (outstanding > limit) {
      nextErrors.outstandingAmount =
        "Outstanding amount cannot exceed the credit limit.";
    }

    if (
      form.minimumDue === "" ||
      !Number.isFinite(minimumDue) ||
      minimumDue < 0
    ) {
      nextErrors.minimumDue = "Enter a valid minimum due.";
    } else if (minimumDue > outstanding) {
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
        "Due date should be on or after the statement date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!validate()) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem("expenseTrackerCreditCards") || "[]"
      );

      if (!Array.isArray(saved)) {
        throw new Error("Invalid saved credit card data.");
      }

      const card = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...form,
        cardName: form.cardName.trim(),
        bankName: form.bankName.trim(),
        creditLimit: Number(form.creditLimit),
        outstandingAmount: Number(form.outstandingAmount),
        availableLimit:
          Number(form.creditLimit) - Number(form.outstandingAmount),
        minimumDue: Number(form.minimumDue),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "expenseTrackerCreditCards",
        JSON.stringify([...saved, card])
      );

      setForm(initialForm);
      setErrors({});
      setMessage("Credit card saved successfully on this device.");
    } catch (error) {
      console.error("Could not save credit card:", error);
      setErrors({
        submit: "Unable to save. Check your browser storage and try again.",
      });
    }
  };

  const currencyFormat = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: form.currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const availableLimit =
    Math.max(
      0,
      (Number(form.creditLimit) || 0) -
        (Number(form.outstandingAmount) || 0)
    );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          ← Back
        </button>

        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Banking / Credit Cards
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Add Credit Card
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your credit limit, outstanding balance, and payment dates.
          </p>
        </div>

        <section className="mb-6 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">
                {form.bankName || "Bank name"}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {form.cardName || "Your Credit Card"}
              </h2>
              <p className="mt-4 text-sm tracking-[0.2em] text-blue-100">
                •••• •••• •••• {form.lastFourDigits || "••••"}
              </p>
            </div>
            <span className="rounded-lg border border-white/30 px-3 py-1 text-xs">
              {form.cardType}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-blue-100">Credit limit</p>
              <p className="mt-1 text-xl font-bold">
                {currencyFormat(form.creditLimit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-100">Available limit</p>
              <p className="mt-1 text-xl font-bold">
                {currencyFormat(availableLimit)}
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${
                  Number(form.creditLimit) > 0
                    ? Math.min(
                        100,
                        (Number(form.outstandingAmount) /
                          Number(form.creditLimit)) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-blue-100">
            {Number(form.creditLimit) > 0
              ? `${Math.round(
                  (Number(form.outstandingAmount) /
                    Number(form.creditLimit)) *
                    100
                )}% of limit used`
              : "Your credit utilization will appear here."}
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {message}
              <button
                type="button"
                onClick={() => navigate("/credit-cards")}
                className="ml-2 underline"
              >
                View cards
              </button>
            </div>
          )}

          {errors.submit && (
            <p role="alert" className="mb-5 text-sm text-red-600">
              {errors.submit}
            </p>
          )}

          <h2 className="mb-5 text-lg font-bold text-slate-900">
            Card information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cardName" className="text-sm font-semibold text-slate-700">
                Card nickname *
              </label>
              <input
                id="cardName"
                name="cardName"
                value={form.cardName}
                onChange={updateField}
                placeholder="e.g. My Shopping Card"
                className={inputClass}
              />
              {errors.cardName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
              )}
            </div>

            <div>
              <label htmlFor="bankName" className="text-sm font-semibold text-slate-700">
                Bank / Issuer *
              </label>
              <input
                id="bankName"
                name="bankName"
                value={form.bankName}
                onChange={updateField}
                placeholder="e.g. HDFC Bank"
                className={inputClass}
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastFourDigits" className="text-sm font-semibold text-slate-700">
                Last 4 digits *
              </label>
              <input
                id="lastFourDigits"
                name="lastFourDigits"
                value={form.lastFourDigits}
                onChange={(event) =>
                  updateField({
                    target: {
                      name: "lastFourDigits",
                      value: event.target.value.replace(/\D/g, "").slice(0, 4),
                    },
                  })
                }
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="1234"
                className={inputClass}
              />
              {errors.lastFourDigits && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastFourDigits}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cardType" className="text-sm font-semibold text-slate-700">
                Card type
              </label>
              <select
                id="cardType"
                name="cardType"
                value={form.cardType}
                onChange={updateField}
                className={inputClass}
              >
                <option value="Credit">Credit Card</option>
              </select>
            </div>

            <div>
              <label htmlFor="creditLimit" className="text-sm font-semibold text-slate-700">
                Total credit limit *
              </label>
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
              {errors.creditLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.creditLimit}</p>
              )}
            </div>

            <div>
              <label htmlFor="outstandingAmount" className="text-sm font-semibold text-slate-700">
                Current outstanding *
              </label>
              <input
                id="outstandingAmount"
                name="outstandingAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.outstandingAmount}
                onChange={updateField}
                className={inputClass}
              />
              {errors.outstandingAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.outstandingAmount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="statementDate" className="text-sm font-semibold text-slate-700">
                Statement date *
              </label>
              <input
                id="statementDate"
                name="statementDate"
                type="date"
                value={form.statementDate}
                onChange={updateField}
                className={inputClass}
              />
              {errors.statementDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.statementDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="dueDate" className="text-sm font-semibold text-slate-700">
                Payment due date *
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={updateField}
                className={inputClass}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="minimumDue" className="text-sm font-semibold text-slate-700">
                Minimum amount due *
              </label>
              <input
                id="minimumDue"
                name="minimumDue"
                type="number"
                min="0"
                step="0.01"
                value={form.minimumDue}
                onChange={updateField}
                className={inputClass}
              />
              {errors.minimumDue && (
                <p className="mt-1 text-sm text-red-600">{errors.minimumDue}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="text-sm font-semibold text-slate-700">
                Currency
              </label>
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
            </div>

            <div>
              <label htmlFor="status" className="text-sm font-semibold text-slate-700">
                Status
              </label>
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
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Save Credit Card
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Demo mode: details are saved in this browser only. No bank connection
          or server storage is configured yet. Store only the last four digits;
          never enter your full card number, CVV, PIN, or OTP.
        </p>
      </div>
    </main>
  );
}

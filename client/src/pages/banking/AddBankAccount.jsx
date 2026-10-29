
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialForm = {
  accountName: "",
  bankName: "",
  accountType: "Savings",
  accountNumber: "",
  openingBalance: "",
  currency: "INR",
  status: "Active",
  notes: "",
};

const accountTypes = [
  "Savings",
  "Current",
  "Salary",
  "Cash Wallet",
  "Credit Card",
  "Fixed Deposit",
];

export default function AddBankAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.accountName.trim()) {
      newErrors.accountName = "Please enter an account nickname.";
    }

    if (!form.bankName.trim()) {
      newErrors.bankName = "Please enter the bank or provider name.";
    }

    if (!form.accountNumber.trim()) {
      newErrors.accountNumber = "Enter the last 4 digits.";
    } else if (!/^\d{4}$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Enter exactly 4 digits.";
    }

    if (
      form.openingBalance === "" ||
      !Number.isFinite(Number(form.openingBalance)) ||
      Number(form.openingBalance) < 0
    ) {
      newErrors.openingBalance = "Enter a valid non-negative balance.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess("");

    if (!validateForm()) return;

    try {
      const storedAccounts = JSON.parse(
        localStorage.getItem("expenseTrackerBankAccounts") || "[]"
      );

      if (!Array.isArray(storedAccounts)) {
        throw new Error("Invalid saved account data.");
      }

      const account = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        accountName: form.accountName.trim(),
        bankName: form.bankName.trim(),
        accountType: form.accountType,
        accountNumber: form.accountNumber,
        openingBalance: Number(form.openingBalance),
        currentBalance: Number(form.openingBalance),
        currency: form.currency,
        status: form.status,
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "expenseTrackerBankAccounts",
        JSON.stringify([...storedAccounts, account])
      );

      setForm(initialForm);
      setErrors({});
      setSuccess("Bank account added successfully on this device.");
    } catch (error) {
      console.error("Unable to save bank account:", error);
      setErrors({
        submit:
          "Could not save the account. Please check your browser storage and try again.",
      });
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <span aria-hidden="true">←</span> Back
        </button>

        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Banking / Accounts
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Add Bank Account
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add a bank account, cash wallet, or deposit to organize your money
            in one place.
          </p>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm text-blue-100">New account preview</p>
          <h2 className="mt-3 text-2xl font-bold">
            {form.accountName || "Your account nickname"}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {form.bankName || "Bank or provider name"}
            {form.accountNumber ? ` •••• ${form.accountNumber}` : ""}
          </p>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-blue-100">Opening balance</p>
              <p className="mt-1 text-2xl font-bold">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: form.currency,
                  maximumFractionDigits: 2,
                }).format(Number(form.openingBalance) || 0)}
              </p>
            </div>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium">
              {form.accountType}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Account information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the details you need to identify this account.
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            >
              {success}
              <button
                type="button"
                onClick={() => navigate("/bank-accounts")}
                className="ml-2 underline underline-offset-2"
              >
                View accounts
              </button>
            </div>
          )}

          {errors.submit && (
            <p role="alert" className="mb-5 text-sm text-red-600">
              {errors.submit}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="accountName">
                Account nickname *
              </label>
              <input
                id="accountName"
                name="accountName"
                value={form.accountName}
                onChange={updateField}
                placeholder="e.g. My Savings"
                className={inputClass}
                aria-invalid={Boolean(errors.accountName)}
              />
              {errors.accountName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accountName}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="bankName">
                Bank / Provider name *
              </label>
              <input
                id="bankName"
                name="bankName"
                value={form.bankName}
                onChange={updateField}
                placeholder="e.g. SBI, HDFC, Cash"
                className={inputClass}
                aria-invalid={Boolean(errors.bankName)}
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bankName}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="accountType">
                Account type *
              </label>
              <select
                id="accountType"
                name="accountType"
                value={form.accountType}
                onChange={updateField}
                className={inputClass}
              >
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="accountNumber">
                Last 4 digits *
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={form.accountNumber}
                onChange={(event) =>
                  updateField({
                    target: {
                      name: "accountNumber",
                      value: event.target.value.replace(/\D/g, "").slice(0, 4),
                    },
                  })
                }
                placeholder="1234"
                className={inputClass}
                aria-invalid={Boolean(errors.accountNumber)}
              />
              <p className="mt-1 text-xs text-slate-500">
                For privacy, enter only the last four digits.
              </p>
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="openingBalance">
                Opening balance *
              </label>
              <input
                id="openingBalance"
                name="openingBalance"
                type="number"
                min="0"
                step="0.01"
                value={form.openingBalance}
                onChange={updateField}
                placeholder="0.00"
                className={inputClass}
                aria-invalid={Boolean(errors.openingBalance)}
              />
              {errors.openingBalance && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.openingBalance}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="currency">
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
              <label className={labelClass} htmlFor="status">
                Account status
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

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="notes">
                Notes <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={updateField}
                rows={3}
                maxLength={500}
                placeholder="Add a note about this account..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Save Bank Account
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Demo storage: this form saves data in this browser only. It does not
          connect to your bank or save the account to the server yet.
        </p>
      </div>
    </main>
  );
}

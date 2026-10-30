
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  Landmark,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerBankAccounts";

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

const currencies = [
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
];

function readAccounts() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatMoney(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${(Number(amount) || 0).toLocaleString("en-IN")}`;
  }
}

function Field({ label, name, required, error, children }) {
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

export default function AddBankAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const openingBalance = Number(form.openingBalance) || 0;

  const previewBalance = useMemo(
    () => formatMoney(openingBalance, form.currency),
    [openingBalance, form.currency]
  );

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

    setSuccess("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.accountName.trim()) {
      nextErrors.accountName = "Please enter an account nickname.";
    }

    if (!form.bankName.trim()) {
      nextErrors.bankName = "Please enter the bank or provider name.";
    }

    if (!/^\d{4}$/.test(form.accountNumber)) {
      nextErrors.accountNumber = "Enter exactly four digits.";
    }

    if (
      form.openingBalance === "" ||
      !Number.isFinite(Number(form.openingBalance)) ||
      Number(form.openingBalance) < 0
    ) {
      nextErrors.openingBalance = "Enter a valid non-negative balance.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const storedAccounts = readAccounts();

      const duplicate = storedAccounts.some(
        (account) =>
          String(account.bankName || "").trim().toLowerCase() ===
            form.bankName.trim().toLowerCase() &&
          String(account.accountNumber || "") === form.accountNumber
      );

      if (duplicate) {
        setErrors({
          accountNumber:
            "An account with this bank and last four digits already exists.",
        });
        setSaving(false);
        return;
      }

      const account = {
        id:
          globalThis.crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        accountName: form.accountName.trim(),
        bankName: form.bankName.trim(),
        accountType: form.accountType,
        accountNumber: form.accountNumber,
        openingBalance,
        currentBalance: openingBalance,
        currency: form.currency,
        status: form.status,
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...storedAccounts, account])
      );

      setForm(initialForm);
      setErrors({});
      setSuccess("Bank account added successfully on this device.");
    } catch (error) {
      console.error("Unable to save bank account:", error);

      setErrors({
        submit:
          "Could not save the account. Check your browser storage and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Navigation */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0D21A1]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Page Header */}
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
            Banking / Accounts
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Add Bank Account
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add a bank account, cash wallet or deposit to organize
            your money in one place.
          </p>
        </header>

        {/* Live Account Preview */}
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-5 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative">
            <div className="flex items-center gap-2 text-blue-100">
              <Landmark size={17} />
              <p className="text-sm font-medium">
                New account preview
              </p>
            </div>

            <h2 className="mt-4 break-words text-2xl font-bold">
              {form.accountName || "Your account nickname"}
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              {form.bankName || "Bank or provider name"}
              {form.accountNumber
                ? ` · •••• ${form.accountNumber}`
                : ""}
            </p>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs text-blue-100">
                  Opening balance
                </p>

                <p className="mt-1 break-words text-2xl font-extrabold">
                  {previewBalance}
                </p>
              </div>

              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                {form.accountType}
              </span>
            </div>
          </div>
        </section>

        {/* Account Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {success && (
            <div
              role="status"
              className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2 font-medium">
                <Check size={18} />
                {success}
              </div>

              <Link
                to="/bank-accounts"
                className="font-semibold underline underline-offset-2"
              >
                View accounts
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

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
              <Building2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Account Information
              </h2>

              <p className="text-xs text-slate-500">
                Enter the details needed to identify this account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <Field
              label="Account nickname"
              name="accountName"
              required
              error={errors.accountName}
            >
              <input
                id="accountName"
                name="accountName"
                type="text"
                value={form.accountName}
                onChange={updateField}
                placeholder="e.g. My Savings"
                maxLength={50}
                className={inputClass}
                aria-invalid={Boolean(errors.accountName)}
              />
            </Field>

            <Field
              label="Bank / Provider name"
              name="bankName"
              required
              error={errors.bankName}
            >
              <input
                id="bankName"
                name="bankName"
                type="text"
                value={form.bankName}
                onChange={updateField}
                placeholder="e.g. SBI, HDFC, Cash"
                maxLength={60}
                className={inputClass}
                aria-invalid={Boolean(errors.bankName)}
              />
            </Field>

            <Field
              label="Account type"
              name="accountType"
              required
            >
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
            </Field>

            <Field
              label="Last 4 digits"
              name="accountNumber"
              required
              error={errors.accountNumber}
            >
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={form.accountNumber}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    accountNumber: event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4),
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    accountNumber: "",
                    submit: "",
                  }));

                  setSuccess("");
                }}
                placeholder="1234"
                className={inputClass}
                aria-invalid={Boolean(errors.accountNumber)}
              />

              <p className="mt-1 text-xs text-slate-500">
                For privacy, enter only the last four digits.
              </p>
            </Field>

            <Field
              label="Opening balance"
              name="openingBalance"
              required
              error={errors.openingBalance}
            >
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
            </Field>

            <Field label="Currency" name="currency">
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={updateField}
                className={inputClass}
              >
                {currencies.map((currency) => (
                  <option
                    key={currency.value}
                    value={currency.value}
                  >
                    {currency.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Account status" name="status">
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

            <Field label="Notes" name="notes">
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
                Protect your banking information
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-900/75">
                Save only the last four digits. Never enter your full
                account number, banking password, PIN or OTP.
              </p>
            </div>
          </div>

          {/* Form Actions */}
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
                  Save Bank Account
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Demo storage: this form saves data in this browser only. It does
          not connect to your bank or save the account to the server.
        </div>
      </div>
    </main>
  );
}

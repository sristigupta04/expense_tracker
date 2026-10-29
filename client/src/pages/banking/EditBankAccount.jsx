
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Wallet } from "lucide-react";

const STORAGE_KEY = "expenseTrackerBankAccounts";

const initialForm = {
  accountName: "",
  bankName: "",
  accountType: "Savings",
  accountNumber: "",
  openingBalance: "0",
  currency: "INR",
  status: "Active",
  notes: "",
};

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function EditBankAccount() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const accounts = readAccounts();
    const account = accounts.find(
      (item) => String(item.id) === String(id)
    );

    if (!account) {
      setError("Bank account not found.");
      setLoading(false);
      return;
    }

    setForm({
      accountName: account.accountName || "",
      bankName: account.bankName || "",
      accountType: account.accountType || "Savings",
      accountNumber: account.accountNumber || "",
      openingBalance: String(account.openingBalance ?? 0),
      currency: account.currency || "INR",
      status: account.status || "Active",
      notes: account.notes || "",
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
      !form.accountName.trim() ||
      !form.bankName.trim() ||
      !form.accountNumber.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{4}$/.test(form.accountNumber.trim())) {
      setError("Enter exactly the last 4 digits of the account number.");
      return;
    }

    const openingBalance = Number(form.openingBalance);

    if (
      form.openingBalance.trim() === "" ||
      !Number.isFinite(openingBalance) ||
      openingBalance < 0
    ) {
      setError("Enter a valid, non-negative opening balance.");
      return;
    }

    const accounts = readAccounts();
    const index = accounts.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      setError("This bank account no longer exists.");
      return;
    }

    const existingAccount = accounts[index];

    accounts[index] = {
      ...existingAccount,
      accountName: form.accountName.trim(),
      bankName: form.bankName.trim(),
      accountType: form.accountType,
      accountNumber: form.accountNumber.trim(),
      openingBalance,
      currency: form.currency,
      status: form.status,
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      navigate(`/bank-accounts/${id}`);
    } catch {
      setError("Could not save changes. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading account details...
      </div>
    );
  }

  if (error === "Bank account not found.") {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-xl font-bold">Account not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This account may have been deleted.
        </p>
        <Link
          to="/bank-accounts"
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-white"
        >
          Back to Bank Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/bank-accounts/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Account Details
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Wallet size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Bank Account
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Update your bank account information.
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
              <Field label="Account Nickname *">
                <input
                  required
                  name="accountName"
                  value={form.accountName}
                  onChange={handleChange}
                  placeholder="e.g. Personal Savings"
                  className={inputClass}
                />
              </Field>

              <Field label="Bank / Provider *">
                <input
                  required
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="e.g. SBI"
                  className={inputClass}
                />
              </Field>

              <Field label="Account Type">
                <select
                  name="accountType"
                  value={form.accountType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Last 4 Digits *">
                <input
                  required
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="1234"
                  className={inputClass}
                />
              </Field>

              <Field label="Opening Balance">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="openingBalance"
                  value={form.openingBalance}
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

              <Field label="Account Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Closed">Closed</option>
                </select>
              </Field>

              <Field label="Notes">
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={`/bank-accounts/${id}`}
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

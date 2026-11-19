
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Wallet,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readAccounts() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normalizeAccount(account) {
  return {
    ...account,
    accountName: account.accountName || account.name || "",
    bankName: account.bankName || "",
    accountType: account.accountType || account.type || "Savings",
    accountNumber: String(
      account.accountNumber || account.lastFour || ""
    ),
    openingBalance:
      account.openingBalance ??
      account.balance ??
      account.currentBalance ??
      0,
    currency: account.currency || "INR",
    status: account.status || "Active",
    notes: account.notes || "",
  };
}

export default function EditBankAccount() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const accounts = readAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id || item._id) === String(accountId)
    );

    if (!account) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const normalized = normalizeAccount(account);

    setForm({
      accountName: normalized.accountName,
      bankName: normalized.bankName,
      accountType: normalized.accountType,
      accountNumber: normalized.accountNumber,
      openingBalance: String(normalized.openingBalance),
      currency: normalized.currency,
      status: normalized.status,
      notes: normalized.notes,
    });

    setLoading(false);
  }, [accountId]);

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

    if (saving) return;

    setError("");
    setSuccess("");

    const accountName = form.accountName.trim();
    const bankName = form.bankName.trim();
    const accountNumber = form.accountNumber.trim();

    if (!accountName || !bankName || !accountNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{4}$/.test(accountNumber)) {
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
      (item) =>
        String(item.id || item._id) === String(accountId)
    );

    if (index === -1) {
      setNotFound(true);
      return;
    }

    const duplicate = accounts.some((item, accountIndex) => {
      if (accountIndex === index) return false;

      const existing = normalizeAccount(item);

      return (
        existing.accountNumber === accountNumber &&
        existing.bankName.trim().toLowerCase() ===
          bankName.toLowerCase()
      );
    });

    if (duplicate) {
      setError(
        "An account with these last four digits already exists for this bank."
      );
      return;
    }

    const existingAccount = accounts[index];

    const updatedAccount = {
      ...existingAccount,

      // New and legacy field compatibility
      accountName,
      name: accountName,

      bankName,

      accountType: form.accountType,
      type: form.accountType,

      accountNumber,
      lastFour: accountNumber,

      openingBalance,
      balance: openingBalance,

      currency: form.currency,
      status: form.status,
      notes: form.notes.trim(),

      updatedAt: new Date().toISOString(),
    };

    setSaving(true);

    try {
      accounts[index] = updatedAccount;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
      );

      setSuccess("Bank account updated successfully.");

      window.setTimeout(() => {
        navigate(`/bank-accounts/${encodeURIComponent(accountId)}`);
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
          Loading account details...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Wallet size={27} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900">
          Account not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This bank account may have been deleted or is no longer available.
        </p>

        <Link
          to="/bank-accounts"
          className="mt-6 inline-flex rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
        >
          Back to Bank Accounts
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <Link
            to={`/bank-accounts/${encodeURIComponent(accountId)}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
          >
            <ArrowLeft size={17} />
            Back to Account Details
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3.5 text-[#0D21A1]">
              <Wallet size={26} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Banking / Bank Accounts
              </p>

              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Edit Bank Account
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update your bank account information and preferences.
              </p>
            </div>
          </div>
        </header>

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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <SectionHeading
                title="Account Information"
                description="Update your account name and banking details."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Account Nickname *">
                  <input
                    required
                    name="accountName"
                    value={form.accountName}
                    onChange={handleChange}
                    maxLength={50}
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
                    maxLength={60}
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
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: "accountNumber",
                          value: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        },
                      })
                    }
                    maxLength={4}
                    pattern="[0-9]{4}"
                    placeholder="1234"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div>
              <SectionHeading
                title="Account Balance"
                description="Update the opening balance and currency."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Opening Balance">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="openingBalance"
                    value={form.openingBalance}
                    onChange={handleChange}
                    placeholder="Enter opening balance"
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
            </div>

            <div className="border-t border-slate-100" />

            <div>
              <SectionHeading
                title="Account Preferences"
                description="Manage the account status and additional notes."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                    maxLength={250}
                    placeholder="Optional notes"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <p className="text-xs leading-5 text-slate-600">
                Only the last four digits of your account number are
                stored in this record. Never enter your full account
                number, PIN or banking password.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={`/bank-accounts/${encodeURIComponent(accountId)}`}
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

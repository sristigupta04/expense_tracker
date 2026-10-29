
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
  Monitor,
  LogOut,
  Fingerprint,
  Download,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={inputClass}
          placeholder={`Enter ${label.toLowerCase()}`}
          required
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SecurityRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
          <Icon size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="sm:shrink-0">{children}</div>
    </div>
  );
}

export default function PrivacySecuritySettings() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [twoFactorPreference, setTwoFactorPreference] = useState(() => {
    try {
      return localStorage.getItem("expenseTracker2FAPreference") === "true";
    } catch {
      return false;
    }
  });

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: form.newPassword.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(form.newPassword),
    },
    {
      label: "Contains a lowercase letter",
      valid: /[a-z]/.test(form.newPassword),
    },
    {
      label: "Contains a number",
      valid: /\d/.test(form.newPassword),
    },
  ];

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!passwordChecks.every((check) => check.valid)) {
      setError("Your new password does not meet all the requirements.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("Choose a new password different from your current password.");
      return;
    }

    setSaving(true);

    try {
      // Requires PATCH /api/auth/change-password on the backend.
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (err?.response?.status === 404
            ? "Password-change API is not implemented yet in your backend."
            : err?.response?.status === 401
              ? "Your session has expired. Please sign in again."
              : "Could not change password. Check your current password and try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleTwoFactorPreference() {
    const nextValue = !twoFactorPreference;

    try {
      localStorage.setItem(
        "expenseTracker2FAPreference",
        String(nextValue)
      );

      setTwoFactorPreference(nextValue);
      setSuccess("");
      setError("");
    } catch {
      setError("Could not save this preference in your browser.");
    }
  }

  async function handleExportPrivacyData() {
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/auth/me");
      const blob = new Blob(
        [JSON.stringify(response.data, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "expense-tracker-account-data.json";
      link.click();
      URL.revokeObjectURL(url);

      setSuccess("Account data export downloaded.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Account data could not be exported. Verify your authenticated account endpoint."
      );
    }
  }

  function handleSignOut() {
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        <header className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
            <ShieldCheck size={15} />
            PRIVACY & SECURITY
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Protect your account
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your password and review your account security options.
          </p>
        </header>

        {(error || success) && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{error || success}</span>
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-4 bg-gradient-to-r from-[#03045E] to-[#0D21A1] p-5 text-white sm:p-6">
            <div className="rounded-xl bg-white/15 p-3">
              <ShieldCheck size={27} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Account security</h2>
              <p className="mt-1 text-sm leading-5 text-blue-100">
                Use a unique password and keep your sign-in details private.
              </p>
            </div>
          </div>

          <div className="px-5 py-1 sm:px-7">
            <SecurityRow
              icon={LockKeyhole}
              title="Password"
              description="Use the form below to change your password."
            >
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                Review regularly
              </span>
            </SecurityRow>

            <SecurityRow
              icon={Fingerprint}
              title="Two-step verification"
              description="Store your preference for enabling extra verification. This does not activate server-side two-factor authentication."
            >
              <button
                type="button"
                role="switch"
                aria-checked={twoFactorPreference}
                onClick={toggleTwoFactorPreference}
                className={`relative h-6 w-11 rounded-full transition ${
                  twoFactorPreference ? "bg-blue-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    twoFactorPreference ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </SecurityRow>

            <SecurityRow
              icon={Download}
              title="Download account data"
              description="Download the account information returned by your authenticated account endpoint."
            >
              <button
                type="button"
                onClick={handleExportPrivacyData}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <Download size={16} />
                Export data
              </button>
            </SecurityRow>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
                <KeyRound size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Change password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your current password before choosing a new one.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5 p-5 sm:p-7">
            <PasswordField
              label="Current password"
              value={form.currentPassword}
              onChange={(e) =>
                updateField("currentPassword", e.target.value)
              }
              visible={visible.current}
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  current: !current.current,
                }))
              }
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              visible={visible.next}
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  next: !current.next,
                }))
              }
              autoComplete="new-password"
            />

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Password requirements
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`flex items-center gap-2 text-xs ${
                      check.valid ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <PasswordField
              label="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateField("confirmPassword", e.target.value)
              }
              visible={visible.confirm}
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  confirm: !current.confirm,
                }))
              }
              autoComplete="new-password"
            />

            {form.confirmPassword && (
              <p
                className={`text-xs ${
                  form.newPassword === form.confirmPassword
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {form.newPassword === form.confirmPassword
                  ? "Passwords match."
                  : "Passwords do not match."}
              </p>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LockKeyhole size={17} />
                )}
                {saving ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert size={21} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-semibold text-amber-900">
                Security reminder
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Never share your password or authentication token. If you
                suspect unauthorized access, use the app's real sign-out
                function and update your password.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Monitor size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Sign-in help</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                If you cannot access your account, use the password recovery
                page.
              </p>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"
              >
                Recover account
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

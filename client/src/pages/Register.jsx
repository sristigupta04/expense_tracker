
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Wallet,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  CircleAlert,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";

import { register } from "../services/authService";

const passwordRules = [
  { label: "At least 12 characters", test: (value) => value.length >= 12 },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One number", test: (value) => /\d/.test(value) },
  {
    label: "One special character",
    test: (value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
  },
];

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to create your account. Please try again."
  );
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordChecks = passwordRules.map((rule) => ({
    label: rule.label,
    valid: rule.test(password),
  }));

  const passwordStrength = passwordChecks.filter(
    (check) => check.valid
  ).length;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (cleanUsername.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (passwordChecks.some((check) => !check.valid)) {
      setError("Please meet all password requirements before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: cleanUsername,
        email: cleanEmail,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: cleanEmail,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          aria-label="Expense Tracker home"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Wallet size={25} strokeWidth={2.2} />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Expense<span className="text-blue-600">Tracker</span>
          </span>
        </Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="p-6 sm:p-9">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserRound size={26} />
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start managing your money with confidence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                    maxLength={80}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-3">
                    <div className="mb-2 flex gap-1.5">
                      {passwordChecks.map((check) => (
                        <div
                          key={check.label}
                          className={`h-1.5 flex-1 rounded-full ${
                            check.valid ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mb-2 text-xs font-medium text-slate-500">
                      {passwordStrength === 5
                        ? "All password requirements met"
                        : `${passwordStrength} of 5 requirements met`}
                    </p>

                    <ul className="grid grid-cols-1 gap-1.5">
                      {passwordChecks.map((check) => (
                        <li
                          key={check.label}
                          className={`flex items-center gap-2 text-xs ${
                            check.valid ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {check.valid ? (
                            <CircleCheck size={14} />
                          ) : (
                            <span className="ml-0.5 mr-0.5 h-2 w-2 rounded-full bg-slate-300" />
                          )}
                          {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                      password === confirmPassword
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <CircleAlert size={15} />
                    )}

                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  <CircleAlert size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 text-xs font-medium text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            Your finances, organized in one place
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Track smarter. Spend better.
        </p>
      </div>
    </main>
  );
}

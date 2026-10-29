
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Wallet,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ChartNoAxesCombined,
} from "lucide-react";

import { useAuth } from "../context/Authcontext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const result = await login(cleanEmail, password);

      if (!result?.success) {
        setError(
          result?.message || "Login failed. Please check your credentials."
        );
        return;
      }

      const requestedPath = location.state?.from;
      const destination =
        typeof requestedPath === "string"
          ? requestedPath
          : requestedPath?.pathname;

      navigate(
        destination && destination !== "/login"
          ? destination
          : "/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F7FF] px-4 py-8 sm:px-6 lg:px-8">
      {/* Soft background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand */}
        <Link
          to="/"
          aria-label="Expense Tracker home"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D21A1] text-white shadow-lg shadow-blue-900/20">
            <Wallet size={25} strokeWidth={2.2} />
          </div>

          <span className="text-[25px] font-extrabold tracking-tight text-[#111827]">
            Expense<span className="text-[#2563EB]">Tracker</span>
          </span>
        </Link>

        {/* Login card */}
        <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_-30px_rgba(30,64,175,0.22)]">
          <div className="p-6 sm:p-9">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="relative mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#EEF4FF] text-[#0D21A1]">
                <LockKeyhole size={29} strokeWidth={1.8} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white">
                  <Sparkles size={12} />
                </span>
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                Welcome back
              </p>

              <h1 className="text-[28px] font-extrabold tracking-tight text-[#111827] sm:text-[32px]">
                Sign in to your account
              </h1>

              <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-slate-500">
                Take control of your money. Your financial overview is just a
                sign-in away.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    id="login-email"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-4 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#2563EB] transition hover:text-[#03045E] hover:underline sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-4 pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0D21A1] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition duration-200 hover:bg-[#03045E] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <p className="mt-7 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-[#2563EB] transition hover:text-[#03045E] hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Security footer */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-[#FAFBFF] px-4 py-4 text-center text-xs font-medium leading-5 text-slate-500 sm:px-6">
            <ShieldCheck
              size={17}
              className="shrink-0 text-emerald-600"
            />
            Sign in to access your personal finance dashboard.
          </div>
        </section>

        {/* Bottom note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ChartNoAxesCombined size={15} />
          <span>Track smarter. Spend better.</span>
        </div>
      </div>
    </main>
  );
}

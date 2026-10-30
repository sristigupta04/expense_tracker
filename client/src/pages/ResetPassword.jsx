
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isValidLink = Boolean(token && email);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!isValidLink) {
      setError("Invalid or incomplete reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        token,
        email,
        password,
      });

      setMessage(
        response.data?.message || "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Your reset link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

        {/* Header */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
          <LockKeyhole size={30} />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900">
          Reset Password
        </h1>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Create a strong new password to secure your account.
        </p>

        {/* Invalid Link */}
        {!isValidLink ? (
          <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-600" size={28} />

            <h2 className="font-semibold text-red-800">
              Invalid Reset Link
            </h2>

            <p className="mt-2 text-sm text-red-700">
              This password reset link is incomplete or invalid. Please request a new reset link.
            </p>

            <Link
              to="/forgot-password"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              Request New Link
            </Link>
          </div>
        ) : message ? (
          /* Success State */
          <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2
              className="mx-auto mb-3 text-emerald-600"
              size={34}
            />

            <h2 className="font-semibold text-emerald-800">
              Password Updated!
            </h2>

            <p className="mt-2 text-sm text-emerald-700">
              {message}
            </p>

            <Link
              to="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Minimum 8 characters, at least one uppercase letter and one number.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match */}
            {confirmPassword && (
              <p
                className={`text-xs font-medium ${
                  password === confirmPassword
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {password === confirmPassword
                  ? "Passwords match."
                  : "Passwords do not match."}
              </p>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-7 border-t border-slate-100 pt-5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-800 transition hover:text-blue-950"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

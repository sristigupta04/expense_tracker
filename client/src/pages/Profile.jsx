
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Wallet,
  ArrowRight,
  Settings,
  LockKeyhole,
  CircleUserRound,
} from "lucide-react";
import { useAuth } from "../context/Authcontext";

export default function Profile() {
  const { user } = useAuth();

  const [showAccountInfo, setShowAccountInfo] = useState(true);

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail = user?.email || "Email not available";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Account Management
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage your personal information and account preferences.
          </p>
        </header>

        {/* Profile banner */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 sm:h-40" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-2xl font-extrabold text-blue-700 shadow-sm sm:h-28 sm:w-28 sm:text-3xl">
                  {initials || <CircleUserRound size={40} />}
                </div>

                <div className="min-w-0 pb-1">
                  <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                    {userName}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {userEmail}
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={15} />
                Account
              </span>
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <button
            type="button"
            onClick={() => setShowAccountInfo((previous) => !previous)}
            aria-expanded={showAccountInfo}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account details
              </p>
            </div>

            <UserRound size={21} className="shrink-0 text-blue-600" />
          </button>

          {showAccountInfo && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={UserRound}
                label="Full name"
                value={userName}
              />

              <InfoCard
                icon={Mail}
                label="Email address"
                value={userEmail}
              />

              <InfoCard
                icon={CalendarDays}
                label="Member since"
                value={memberSince}
              />

              <InfoCard
                icon={ShieldCheck}
                label="Account status"
                value="Signed in"
              />
            </div>
          )}
        </section>

        {/* Account shortcuts */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Account Shortcuts
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <ShortcutCard
              to="/settings"
              icon={Settings}
              title="Settings"
              description="Manage your app preferences."
            />

            <ShortcutCard
              to="/dashboard"
              icon={Wallet}
              title="My Dashboard"
              description="View your income and expenses."
            />

            <ShortcutCard
              to="/transactions"
              icon={ArrowRight}
              title="Transactions"
              description="Review your financial activity."
            />

            <ShortcutCard
              to="/settings"
              icon={LockKeyhole}
              title="Account Preferences"
              description="Visit settings to review available options."
            />
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          Your financial journey, all in one place.
        </p>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function ShortcutCard({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
      />
    </Link>
  );
}

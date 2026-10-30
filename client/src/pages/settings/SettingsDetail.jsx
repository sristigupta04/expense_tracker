
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Palette,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  CircleHelp,
  UserRoundCog,
  Save,
  Sun,
  Moon,
  Monitor,
  Mail,
  CalendarDays,
  IndianRupee,
  LockKeyhole,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Settings as SettingsIcon,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerSettings";

const defaultSettings = {
  profile: {
    name: "",
    email: "",
    phone: "",
  },
  theme: "light",
  dateFormat: "DD/MM/YYYY",
  currency: "INR",
  notifications: {
    budgetAlerts: true,
    expenseReminders: true,
    weeklySummary: false,
  },
};

const pageInfo = {
  profile: {
    title: "Profile",
    description: "Manage your personal information.",
    icon: UserRound,
  },
  appearance: {
    title: "Appearance",
    description: "Customize how your workspace looks.",
    icon: Palette,
  },
  preferences: {
    title: "Preferences",
    description: "Choose your date format and currency.",
    icon: SlidersHorizontal,
  },
  notifications: {
    title: "Notifications",
    description: "Choose which reminders you want to receive.",
    icon: Bell,
  },
  privacy: {
    title: "Privacy & Security",
    description: "Review your account security options.",
    icon: ShieldCheck,
  },
  account: {
    title: "Account Management",
    description: "Manage the status of your account.",
    icon: UserRoundCog,
  },
  help: {
    title: "Help & Support",
    description: "Get help using your expense tracker.",
    icon: CircleHelp,
  },
};

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return {
      ...defaultSettings,
      ...saved,
      profile: {
        ...defaultSettings.profile,
        ...(saved.profile || {}),
      },
      notifications: {
        ...defaultSettings.notifications,
        ...(saved.notifications || {}),
      },
    };
  } catch {
    return {
      ...defaultSettings,
      profile: { ...defaultSettings.profile },
      notifications: { ...defaultSettings.notifications },
    };
  }
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
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

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-[#0D21A1]" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
          error ? "border-rose-400" : "border-slate-200"
        }`}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function SettingsDetail() {
  const { section } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(readSettings);
  const [profile, setProfile] = useState(() => readSettings().profile);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [profileErrors, setProfileErrors] = useState({});

  const page = pageInfo[section];
  const PageIcon = page?.icon;

  useEffect(() => {
    const saved = readSettings();

    setSettings(saved);
    setProfile(saved.profile);
    setMessage("");
    setProfileErrors({});
  }, [section]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
  }

  function updateNotification(key, value) {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value,
      },
    }));

    setMessage("");
  }

  function validateProfile() {
    const errors = {};

    if (!profile.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!profile.email.trim()) {
      errors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (
      profile.phone.trim() &&
      !/^[+]?[\d\s()-]{7,20}$/.test(profile.phone.trim())
    ) {
      errors.phone = "Enter a valid phone number.";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function saveSettings(event) {
    event?.preventDefault();

    if (section === "profile" && !validateProfile()) {
      return;
    }

    const next = {
      ...settings,
      profile:
        section === "profile"
          ? {
              name: profile.name.trim(),
              email: profile.email.trim(),
              phone: profile.phone.trim(),
            }
          : settings.profile,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSettings(next);
      setProfile(next.profile);
      setProfileErrors({});
      showMessage("Your settings have been saved successfully.");
    } catch (error) {
      console.error("Unable to save settings:", error);
      showMessage(
        "Could not save settings in this browser. Check storage and try again.",
        "error"
      );
    }
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#0D21A1]">
            <SettingsIcon size={25} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Settings page not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The settings section you requested does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="mt-5 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#03045E]"
          >
            Back to Settings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0D21A1]"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        {/* Header */}
        <header className="mb-6 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-100 p-3.5 text-[#0D21A1]">
            <PageIcon size={27} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {page.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {page.description}
            </p>
          </div>
        </header>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-2 rounded-xl border p-3.5 text-sm ${
              messageType === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {messageType === "error" ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}

            {message}
          </div>
        )}

        <form
          onSubmit={saveSettings}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-7"
        >

          {/* Profile */}
          {section === "profile" && (
            <div className="space-y-5 py-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-[#0D21A1]">
                  <UserRound size={25} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Personal Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Update your profile information.
                  </p>
                </div>
              </div>

              <Field
                label="Full name"
                name="name"
                value={profile.name}
                onChange={(event) => {
                  setProfile((current) => ({
                    ...current,
                    name: event.target.value,
                  }));
                  setProfileErrors((current) => ({
                    ...current,
                    name: "",
                  }));
                  setMessage("");
                }}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={80}
                required
                error={profileErrors.name}
              />

              <Field
                label="Email address"
                name="email"
                type="email"
                value={profile.email}
                onChange={(event) => {
                  setProfile((current) => ({
                    ...current,
                    email: event.target.value,
                  }));
                  setProfileErrors((current) => ({
                    ...current,
                    email: "",
                  }));
                  setMessage("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                error={profileErrors.email}
              />

              <Field
                label="Phone number"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={(event) => {
                  setProfile((current) => ({
                    ...current,
                    phone: event.target.value,
                  }));
                  setProfileErrors((current) => ({
                    ...current,
                    phone: "",
                  }));
                  setMessage("");
                }}
                placeholder="Enter phone number"
                autoComplete="tel"
                error={profileErrors.phone}
              />

              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                These profile details are saved in this browser for now.
                Backend profile updates are not connected here.
              </p>
            </div>
          )}

          {/* Appearance */}
          {section === "appearance" && (
            <div className="py-2">
              <SettingRow
                icon={Sun}
                title="Light Theme"
                description="A clean, bright workspace."
              >
                <button
                  type="button"
                  onClick={() => updateSetting("theme", "light")}
                  aria-pressed={settings.theme === "light"}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    settings.theme === "light"
                      ? "border-[#0D21A1] bg-blue-50 text-[#0D21A1]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Light
                </button>
              </SettingRow>

              <SettingRow
                icon={Moon}
                title="Dark Theme"
                description="A darker appearance for low-light environments."
              >
                <button
                  type="button"
                  onClick={() => updateSetting("theme", "dark")}
                  aria-pressed={settings.theme === "dark"}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    settings.theme === "dark"
                      ? "border-[#0D21A1] bg-blue-50 text-[#0D21A1]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Dark
                </button>
              </SettingRow>

              <SettingRow
                icon={Monitor}
                title="Current Appearance"
                description="Your selected appearance preference."
              >
                <span className="text-sm font-semibold text-slate-600">
                  {settings.theme === "dark" ? "Dark mode" : "Light mode"}
                </span>
              </SettingRow>

              <p className="py-4 text-xs leading-5 text-slate-500">
                The selected theme preference is saved locally. Full
                application-wide dark styling requires theme classes in
                the rest of the application.
              </p>
            </div>
          )}

          {/* Preferences */}
          {section === "preferences" && (
            <div className="py-2">
              <SettingRow
                icon={CalendarDays}
                title="Date Format"
                description="Choose how dates are displayed in your workspace."
              >
                <select
                  value={settings.dateFormat}
                  onChange={(event) =>
                    updateSetting("dateFormat", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-48"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </SettingRow>

              <SettingRow
                icon={IndianRupee}
                title="Currency"
                description="Choose the preferred currency for financial display."
              >
                <select
                  value={settings.currency}
                  onChange={(event) =>
                    updateSetting("currency", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-48"
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — Pound Sterling</option>
                </select>
              </SettingRow>

              <p className="py-4 text-xs leading-5 text-slate-500">
                These preferences are saved locally. Other pages must
                read these settings to apply the selected date format
                and currency consistently.
              </p>
            </div>
          )}

          {/* Notifications */}
          {section === "notifications" && (
            <div className="py-2">
              <SettingRow
                icon={Bell}
                title="Budget Alerts"
                description="Preference for alerts when spending approaches a budget limit."
              >
                <Toggle
                  label="Budget alerts"
                  checked={settings.notifications.budgetAlerts}
                  onChange={(value) =>
                    updateNotification("budgetAlerts", value)
                  }
                />
              </SettingRow>

              <SettingRow
                icon={CalendarDays}
                title="Expense Reminders"
                description="Preference for reminders to review or record expenses."
              >
                <Toggle
                  label="Expense reminders"
                  checked={settings.notifications.expenseReminders}
                  onChange={(value) =>
                    updateNotification("expenseReminders", value)
                  }
                />
              </SettingRow>

              <SettingRow
                icon={Mail}
                title="Weekly Summary"
                description="Preference for a weekly summary of your finances."
              >
                <Toggle
                  label="Weekly summary"
                  checked={settings.notifications.weeklySummary}
                  onChange={(value) =>
                    updateNotification("weeklySummary", value)
                  }
                />
              </SettingRow>

              <p className="py-4 text-xs leading-5 text-slate-500">
                These switches save your preferences only. Actual email,
                push or in-app notification delivery must be connected
                separately.
              </p>
            </div>
          )}

          {/* Privacy */}
          {section === "privacy" && (
            <div className="py-2">
              <SettingRow
                icon={LockKeyhole}
                title="Password and Login"
                description="Use the password reset flow to update your password securely."
              >
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0D21A1] transition hover:bg-blue-50"
                >
                  Reset Password
                </Link>
              </SettingRow>

              <SettingRow
                icon={ShieldCheck}
                title="Session Security"
                description="Always sign out when using a shared computer."
              >
                <span className="text-sm font-medium text-slate-500">
                  Security tip
                </span>
              </SettingRow>

              <SettingRow
                icon={UserRound}
                title="Account Privacy"
                description="Avoid sharing passwords, OTPs or sensitive financial details."
              >
                <span className="text-sm font-semibold text-emerald-700">
                  <ShieldCheck size={16} className="mr-1 inline" />
                  Stay protected
                </span>
              </SettingRow>
            </div>
          )}

          {/* Account Management */}
          {section === "account" && (
            <div className="py-2">
              <div className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <h2 className="font-semibold text-amber-900">
                      Account actions need care
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-amber-800">
                      Deactivation and permanent deletion are not enabled
                      until authenticated backend endpoints are implemented.
                      This avoids accidentally losing financial records.
                    </p>
                  </div>
                </div>
              </div>

              <SettingRow
                icon={UserRoundCog}
                title="Deactivate Account"
                description="Temporarily disable access to your account."
              >
                <button
                  type="button"
                  disabled
                  title="Backend endpoint needs to be implemented"
                  className="cursor-not-allowed rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400"
                >
                  Not connected
                </button>
              </SettingRow>

              <SettingRow
                icon={AlertTriangle}
                title="Delete Account"
                description="Permanent deletion should require re-authentication and confirmation."
              >
                <button
                  type="button"
                  disabled
                  title="Backend endpoint needs to be implemented"
                  className="cursor-not-allowed rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-300"
                >
                  Not connected
                </button>
              </SettingRow>
            </div>
          )}

          {/* Help */}
          {section === "help" && (
            <div className="py-2">
              <SettingRow
                icon={CircleHelp}
                title="Frequently Asked Questions"
                description="Learn how to manage transactions, budgets and reports."
              >
                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      "Tip: use Transactions to record expenses, Budgets to set spending limits, and Reports to review your financial activity."
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0D21A1] transition hover:bg-blue-50"
                >
                  Quick Tip
                </button>
              </SettingRow>

              <SettingRow
                icon={MessageCircle}
                title="Contact Support"
                description="Get help with a problem or report an issue."
              >
                <a
                  href="mailto:support@example.com?subject=Expense%20Tracker%20Support"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0D21A1] transition hover:bg-blue-50"
                >
                  <Mail size={15} />
                  Email Support
                </a>
              </SettingRow>

              <p className="py-4 text-xs text-slate-500">
                Replace support@example.com with your actual support email
                before publishing the application.
              </p>
            </div>
          )}

          {/* Save */}
          {["profile", "preferences", "notifications"].includes(section) && (
            <div className="flex justify-end border-t border-slate-100 py-5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      ...defaultSettings,
      ...saved,
      profile: { ...defaultSettings.profile, ...saved.profile },
      notifications: {
        ...defaultSettings.notifications,
        ...saved.notifications,
      },
    };
  } catch {
    return defaultSettings;
  }
}

function SettingRow({ icon: Icon, title, description, children }) {
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

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-blue-700" : "bg-slate-300"
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

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

export default function SettingsDetail() {
  const { section } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(readSettings);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(() => {
    const saved = readSettings();
    return saved.profile;
  });

  const page = pageInfo[section];

  useEffect(() => {
    setMessage("");
    setSettings(readSettings());
    setProfile(readSettings().profile);
  }, [section]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold">Settings page not found</h1>
          <button
            onClick={() => navigate("/settings")}
            className="mt-4 font-semibold text-blue-700"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  const PageIcon = page.icon;

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
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

  function saveSettings(event) {
    event?.preventDefault();

    const next = {
      ...settings,
      profile: section === "profile" ? profile : settings.profile,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSettings(next);
      setMessage("Your settings have been saved.");
    } catch {
      setMessage("Could not save settings in this browser.");
    }
  }

  function saveProfile(event) {
    event.preventDefault();
    saveSettings(event);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-100 p-3.5 text-blue-800">
            <PageIcon size={27} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {page.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {page.description}
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        <form
          onSubmit={section === "profile" ? saveProfile : saveSettings}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-7"
        >
          {section === "profile" && (
            <div className="space-y-5 py-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-blue-800">
                  <UserRound size={25} />
                </div>
                <div>
                  <h2 className="font-semibold">Personal details</h2>
                  <p className="text-sm text-slate-500">
                    Update your profile information.
                  </p>
                </div>
              </div>

              <Field
                label="Full name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

              <Field
                label="Email address"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Field
                label="Phone number"
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="Enter phone number"
                autoComplete="tel"
              />

              <p className="text-xs leading-5 text-amber-700">
                These details are saved in this browser for now. Backend
                profile updates still need to be connected.
              </p>
            </div>
          )}

          {section === "appearance" && (
            <div className="py-2">
              <SettingRow
                icon={Sun}
                title="Light theme"
                description="A clean, bright workspace."
              >
                <button
                  type="button"
                  onClick={() => updateSetting("theme", "light")}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    settings.theme === "light"
                      ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Light
                </button>
              </SettingRow>

              <SettingRow
                icon={Moon}
                title="Dark theme"
                description="A darker appearance for low-light environments."
              >
                <button
                  type="button"
                  onClick={() => updateSetting("theme", "dark")}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    settings.theme === "dark"
                      ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Dark
                </button>
              </SettingRow>

              <SettingRow
                icon={Monitor}
                title="Preview"
                description="See the selected appearance."
              >
                <span className="text-sm font-semibold text-slate-600">
                  {settings.theme === "dark" ? "Dark mode" : "Light mode"}
                </span>
              </SettingRow>
            </div>
          )}

          {section === "preferences" && (
            <div className="py-2">
              <SettingRow
                icon={CalendarDays}
                title="Date format"
                description="Choose how dates are displayed in your workspace."
              >
                <select
                  value={settings.dateFormat}
                  onChange={(e) =>
                    updateSetting("dateFormat", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:w-44"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </SettingRow>

              <SettingRow
                icon={IndianRupee}
                title="Currency"
                description="Choose the currency for your financial display."
              >
                <select
                  value={settings.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:w-44"
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — Pound Sterling</option>
                </select>
              </SettingRow>
            </div>
          )}

          {section === "notifications" && (
            <div className="py-2">
              <SettingRow
                icon={Bell}
                title="Budget alerts"
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
                title="Expense reminders"
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
                title="Weekly summary"
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

          {section === "privacy" && (
            <div className="py-2">
              <SettingRow
                icon={LockKeyhole}
                title="Password and login"
                description="Password changes must be handled through your secure backend."
              >
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  Reset password
                </button>
              </SettingRow>

              <SettingRow
                icon={ShieldCheck}
                title="Session security"
                description="Always sign out when using a shared computer."
              >
                <span className="text-sm text-slate-500">
                  Security tip
                </span>
              </SettingRow>
            </div>
          )}

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
                      until the authenticated backend endpoints are verified.
                      This avoids accidentally losing your financial records.
                    </p>
                  </div>
                </div>
              </div>

              <SettingRow
                icon={UserRoundCog}
                title="Deactivate account"
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
                title="Delete account"
                description="Permanent deletion should require re-authentication and confirmation."
              >
                <button
                  type="button"
                  disabled
                  title="Backend endpoint needs to be implemented"
                  className="cursor-not-allowed rounded-xl border border-red-200 px-3 py-2 text-sm text-red-300"
                >
                  Not connected
                </button>
              </SettingRow>
            </div>
          )}

          {section === "help" && (
            <div className="py-2">
              <SettingRow
                icon={CircleHelp}
                title="Frequently asked questions"
                description="Learn how to manage transactions, budgets and reports."
              >
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Tip: use Transactions to record expenses and Budgets to set spending limits."
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  Quick tip
                </button>
              </SettingRow>

              <SettingRow
                icon={MessageCircle}
                title="Contact support"
                description="Get help with a problem or report an issue."
              >
                <a
                  href="mailto:support@example.com?subject=Expense%20Tracker%20Support"
                  className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  Email support
                </a>
              </SettingRow>

              <p className="py-4 text-xs text-slate-500">
                Replace support@example.com with your actual support email
                before publishing the application.
              </p>
            </div>
          )}

          {["profile", "preferences", "notifications"].includes(section) && (
            <div className="flex justify-end border-t border-slate-100 py-5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Save size={17} />
                Save changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

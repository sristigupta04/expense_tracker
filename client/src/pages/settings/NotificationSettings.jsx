
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Wallet,
  CalendarDays,
  TrendingUp,
  Mail,
  Smartphone,
  BellRing,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Info,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerSettings";

const defaultNotifications = {
  budgetAlerts: true,
  expenseReminders: true,
  weeklySummary: false,
  largeExpenseAlerts: true,
  recurringReminders: true,
  emailNotifications: false,
  browserNotifications: false,
};

function readNotifications() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return {
      ...defaultNotifications,
      ...(saved.notifications || {}),
    };
  } catch {
    return { ...defaultNotifications };
  }
}

const notificationGroups = [
  {
    title: "Spending & budgets",
    description: "Stay aware of your spending activity.",
    items: [
      {
        key: "budgetAlerts",
        title: "Budget alerts",
        description: "Alerts when spending approaches a budget limit.",
        icon: Wallet,
      },
      {
        key: "largeExpenseAlerts",
        title: "Large expense alerts",
        description: "Preference for alerts about unusually large expenses.",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Reminders & reports",
    description: "Keep up with your financial routine.",
    items: [
      {
        key: "expenseReminders",
        title: "Expense reminders",
        description: "Reminders to record or review your expenses.",
        icon: CalendarDays,
      },
      {
        key: "recurringReminders",
        title: "Recurring expense reminders",
        description: "Reminders for upcoming recurring payments.",
        icon: Clock,
      },
      {
        key: "weeklySummary",
        title: "Weekly financial summary",
        description: "Preference for a weekly overview of your finances.",
        icon: BellRing,
      },
    ],
  },
  {
    title: "Delivery preferences",
    description: "Choose your preferred notification channels.",
    items: [
      {
        key: "emailNotifications",
        title: "Email notifications",
        description: "Choose whether you want email updates.",
        icon: Mail,
      },
      {
        key: "browserNotifications",
        title: "Browser notifications",
        description: "Allow this website to request browser notification permission.",
        icon: Smartphone,
      },
    ],
  },
];

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-blue-700" : "bg-slate-300"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationSettings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(readNotifications);
  const [original, setOriginal] = useState(readNotifications);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [permission, setPermission] = useState(() =>
    typeof window !== "undefined" &&
    "Notification" in window
      ? Notification.permission
      : "unsupported"
  );
  const [requestingPermission, setRequestingPermission] = useState(false);

  const dirty =
    JSON.stringify(notifications) !== JSON.stringify(original);

  const enabledCount = Object.values(notifications).filter(Boolean).length;

  useEffect(() => {
    if (
      notifications.browserNotifications &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      setPermission(Notification.permission);
    }
  }, [notifications.browserNotifications]);

  function update(key, value) {
    setNotifications((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
  }

  async function toggleBrowserNotifications(enabled) {
    if (!enabled) {
      update("browserNotifications", false);
      return;
    }

    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      setMessage("This browser does not support web notifications.");
      setMessageType("error");
      return;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      update("browserNotifications", true);
      return;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      setMessage(
        "Browser notifications are blocked. Change this website's notification permission in your browser settings."
      );
      setMessageType("error");
      return;
    }

    setRequestingPermission(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        update("browserNotifications", true);
        setMessage(
          "Browser permission granted. Save your preferences to keep this setting."
        );
        setMessageType("success");
      } else {
        update("browserNotifications", false);
        setMessage(
          result === "denied"
            ? "Notifications were blocked in your browser."
            : "Notification permission was not granted."
        );
        setMessageType("error");
      }
    } catch {
      setMessage("Could not request browser notification permission.");
      setMessageType("error");
    } finally {
      setRequestingPermission(false);
    }
  }

  function saveNotifications(event) {
    event.preventDefault();

    try {
      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...existing,
          notifications,
        })
      );

      setOriginal(notifications);
      setMessage("Notification preferences saved successfully.");
      setMessageType("success");
    } catch {
      setMessage("Could not save preferences in this browser.");
      setMessageType("error");
    }
  }

  function resetNotifications() {
    setNotifications({ ...defaultNotifications });
    setMessage("");
  }

  function testBrowserNotification() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      setMessage("This browser does not support notifications.");
      setMessageType("error");
      return;
    }

    if (Notification.permission !== "granted") {
      setMessage("Enable browser notifications and grant permission first.");
      setMessageType("error");
      return;
    }

    try {
      new Notification("Expense Tracker", {
        body: "Browser notifications are working on this device.",
      });
      setMessage("Test notification sent to your browser.");
      setMessageType("success");
    } catch {
      setMessage("Unable to show a test notification.");
      setMessageType("error");
    }
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
            <Bell size={15} />
            NOTIFICATIONS
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Notification settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Choose which financial reminders and alerts you want to receive.
          </p>
        </header>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {messageType === "error" ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#03045E] to-[#0D21A1] p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-xl bg-white/15 p-3">
                  <BellRing size={25} />
                </div>
                <h2 className="text-lg font-bold">
                  Your notification preferences
                </h2>
                <p className="mt-1 text-sm leading-5 text-blue-100">
                  Manage alerts that help you stay on top of your finances.
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-center">
                <p className="text-2xl font-bold">{enabledCount}</p>
                <p className="text-xs text-blue-100">Enabled</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Info size={19} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-slate-600">
                These switches save your preferences. Automatic budget alerts,
                scheduled reminders and email delivery require notification
                services in the backend.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={saveNotifications} className="space-y-6">
          {notificationGroups.map((group) => (
            <section
              key={group.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-7"
            >
              <div className="border-b border-slate-100 py-5">
                <h2 className="text-lg font-bold">{group.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {group.description}
                </p>
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isBrowserToggle =
                  item.key === "browserNotifications";

                return (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 border-b border-slate-100 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
                        <Icon size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {item.title}
                        </h3>
                        <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>

                        {isBrowserToggle && (
                          <p className="mt-2 text-xs text-slate-500">
                            Browser permission:{" "}
                            <span className="font-semibold">
                              {permission === "unsupported"
                                ? "Not supported"
                                : permission}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:shrink-0">
                      {isBrowserToggle &&
                        notifications.browserNotifications &&
                        permission === "granted" && (
                          <button
                            type="button"
                            onClick={testBrowserNotification}
                            className="text-xs font-semibold text-blue-800 hover:underline"
                          >
                            Test
                          </button>
                        )}

                      <Toggle
                        label={item.title}
                        checked={notifications[item.key]}
                        disabled={
                          isBrowserToggle && requestingPermission
                        }
                        onChange={(value) =>
                          isBrowserToggle
                            ? toggleBrowserNotifications(value)
                            : update(item.key, value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </section>
          ))}

          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={21} className="mt-0.5 shrink-0 text-blue-800" />
              <div>
                <h2 className="font-bold text-slate-800">
                  Notification privacy
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Notification preferences are stored in this browser. Email
                  updates are not sent just because the email switch is on.
                  Browser notifications require your permission.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={resetNotifications}
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset changes
            </button>

            <button
              type="submit"
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />
              Save preferences
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

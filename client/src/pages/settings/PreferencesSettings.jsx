
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  SlidersHorizontal,
  CalendarDays,
  IndianRupee,
  Hash,
  CalendarRange,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Eye,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerSettings";

const defaults = {
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  weekStartsOn: "monday",
  numberFormat: "en-IN",
  compactNumbers: false,
  showDecimals: true,
};

const currencyOptions = [
  { value: "INR", label: "INR — Indian Rupee", symbol: "₹" },
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
  { value: "JPY", label: "JPY — Japanese Yen", symbol: "¥" },
];

const dateOptions = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
];

const numberOptions = [
  { value: "en-IN", label: "Indian — 1,23,456.78" },
  { value: "en-US", label: "International — 123,456.78" },
  { value: "de-DE", label: "European — 123.456,78" },
];

function readPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return {
      ...defaults,
      ...(saved.preferences || {}),
      // Backward compatibility with settings saved by earlier versions.
      currency: saved.preferences?.currency || saved.currency || defaults.currency,
      dateFormat:
        saved.preferences?.dateFormat ||
        saved.dateFormat ||
        defaults.dateFormat,
    };
  } catch {
    return { ...defaults };
  }
}

function PreferenceRow({ icon: Icon, title, description, children }) {
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

      <div className="w-full sm:w-64 sm:shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
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

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        {children}
      </select>
    </label>
  );
}

export default function PreferencesSettings() {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(readPreferences);
  const [original, setOriginal] = useState(readPreferences);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const dirty = JSON.stringify(preferences) !== JSON.stringify(original);

  useEffect(() => {
    document.documentElement.lang = preferences.numberFormat;
  }, [preferences.numberFormat]);

  function update(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
  }

  function savePreferences(event) {
    event.preventDefault();

    try {
      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      const combined = {
        ...existing,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        preferences,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));

      setOriginal(preferences);
      setMessage("Your preferences have been saved.");
      setMessageType("success");
    } catch {
      setMessage("Unable to save preferences in this browser.");
      setMessageType("error");
    }
  }

  function resetPreferences() {
    setPreferences({ ...defaults });
    setMessage("");
  }

  const currency =
    currencyOptions.find((item) => item.value === preferences.currency) ||
    currencyOptions[0];

  const exampleAmount = new Intl.NumberFormat(
    preferences.numberFormat,
    {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: preferences.showDecimals ? 2 : 0,
      maximumFractionDigits: preferences.showDecimals ? 2 : 0,
    }
  ).format(123456.78);

  const exampleDate = (() => {
    const date = new Date(2026, 9, 29);

    if (preferences.dateFormat === "YYYY-MM-DD") {
      return "2026-10-29";
    }

    if (preferences.dateFormat === "MM/DD/YYYY") {
      return "10/29/2026";
    }

    return "29/10/2026";
  })();

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
            <SlidersHorizontal size={15} />
            PREFERENCES
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Preferences
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Customize how dates, currencies and financial values are displayed.
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

        <form onSubmit={savePreferences}>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-7">
            <div className="border-b border-slate-100 py-5">
              <h2 className="text-lg font-bold">Regional preferences</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose how financial information is formatted.
              </p>
            </div>

            <PreferenceRow
              icon={IndianRupee}
              title="Currency"
              description="Select the currency symbol used in your financial display."
            >
              <SelectField
                label="Currency"
                value={preferences.currency}
                onChange={(value) => update("currency", value)}
              >
                {currencyOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
            </PreferenceRow>

            <PreferenceRow
              icon={CalendarDays}
              title="Date format"
              description="Choose how transaction dates should appear."
            >
              <SelectField
                label="Date format"
                value={preferences.dateFormat}
                onChange={(value) => update("dateFormat", value)}
              >
                {dateOptions.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </SelectField>
            </PreferenceRow>

            <PreferenceRow
              icon={CalendarRange}
              title="Week starts on"
              description="Choose the first day of your weekly reports."
            >
              <SelectField
                label="Week starts on"
                value={preferences.weekStartsOn}
                onChange={(value) => update("weekStartsOn", value)}
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
                <option value="saturday">Saturday</option>
              </SelectField>
            </PreferenceRow>

            <PreferenceRow
              icon={Globe}
              title="Number format"
              description="Choose how thousands separators and decimals appear."
            >
              <SelectField
                label="Number format"
                value={preferences.numberFormat}
                onChange={(value) => update("numberFormat", value)}
              >
                {numberOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
            </PreferenceRow>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-7">
            <div className="border-b border-slate-100 py-5">
              <h2 className="text-lg font-bold">Display options</h2>
              <p className="mt-1 text-sm text-slate-500">
                Adjust how financial amounts are presented.
              </p>
            </div>

            <PreferenceRow
              icon={Hash}
              title="Show decimal places"
              description="Display two decimal places for financial amounts."
            >
              <Toggle
                label="Show decimal places"
                checked={preferences.showDecimals}
                onChange={(value) => update("showDecimals", value)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Eye}
              title="Compact numbers"
              description="Display large amounts in a shortened format, such as 1.2L or 1.2M."
            >
              <Toggle
                label="Compact numbers"
                checked={preferences.compactNumbers}
                onChange={(value) => update("compactNumbers", value)}
              />
            </PreferenceRow>
          </section>

          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Eye size={19} className="text-blue-800" />
              <h2 className="font-bold text-slate-800">Live preview</h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Preview of your selected preferences.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">
                  Example amount
                </p>
                <p className="mt-2 break-words text-2xl font-bold text-[#0D21A1]">
                  {preferences.compactNumbers
                    ? new Intl.NumberFormat(preferences.numberFormat, {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(123456.78) + ` ${currency.symbol}`
                    : exampleAmount}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">
                  Example date
                </p>
                <p className="mt-2 text-xl font-bold text-slate-800">
                  {exampleDate}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              These settings are saved locally. Other dashboard and report
              components must read these preferences to apply them throughout
              the application.
            </p>
          </section>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={resetPreferences}
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

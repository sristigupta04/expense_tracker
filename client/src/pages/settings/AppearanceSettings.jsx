
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Save,
  Eye,
  LayoutDashboard,
  Circle,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerSettings";

const defaults = {
  theme: "light",
  accentColor: "#0D21A1",
  compactLayout: false,
};

const accentColors = [
  { name: "Royal Blue", value: "#0D21A1" },
  { name: "Bright Blue", value: "#2563EB" },
  { name: "Deep Navy", value: "#03045E" },
  { name: "Teal", value: "#0F766E" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Rose", value: "#E11D48" },
];

function readAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaults, ...(saved.appearance || {}) };
  } catch {
    return { ...defaults };
  }
}

function applyAppearance(settings) {
  const root = document.documentElement;
  const dark =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", dark);
  root.dataset.theme = dark ? "dark" : "light";
  root.style.setProperty("--app-accent", settings.accentColor);
  root.dataset.compact = String(settings.compactLayout);
}

export default function AppearanceSettings() {
  const navigate = useNavigate();
  const [appearance, setAppearance] = useState(readAppearance);
  const [original, setOriginal] = useState(readAppearance);
  const [message, setMessage] = useState("");

  const dirty =
    JSON.stringify(appearance) !== JSON.stringify(original);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    if (appearance.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => applyAppearance(appearance);

    media.addEventListener?.("change", updateTheme);
    return () => media.removeEventListener?.("change", updateTheme);
  }, [appearance]);

  function updateSetting(key, value) {
    setAppearance((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function saveAppearance(event) {
    event.preventDefault();

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, appearance })
      );

      setOriginal({ ...appearance });
      setMessage("Appearance preferences saved successfully.");
    } catch {
      setMessage("Could not save settings in this browser.");
    }
  }

  function resetAppearance() {
    setAppearance({ ...defaults });
    setMessage("");
  }

  const themeOptions = [
    {
      value: "light",
      title: "Light",
      description: "Clean and bright",
      Icon: Sun,
    },
    {
      value: "dark",
      title: "Dark",
      description: "Comfortable in low light",
      Icon: Moon,
    },
    {
      value: "system",
      title: "System",
      description: "Follow your device",
      Icon: Monitor,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-800">
            <Palette size={15} />
            Personalization
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Appearance
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Customize your theme, colors and layout to make your
            Expense Tracker feel right for you.
          </p>
        </header>

        {message && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-900"
          >
            {message}
          </p>
        )}

        <form onSubmit={saveAppearance} className="space-y-6">
          {/* Theme */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                <Sun size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Theme</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose how your application looks.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map(({ value, title, description, Icon }) => {
                const selected = appearance.theme === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateSetting("theme", value)}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-blue-700 bg-blue-50/70"
                        : "border-slate-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Icon
                        size={22}
                        className={selected ? "text-blue-800" : "text-slate-500"}
                      />
                      {selected && (
                        <span className="rounded-full bg-blue-700 p-1 text-white">
                          <Check size={13} />
                        </span>
                      )}
                    </div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Accent color */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-800">
                <Palette size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Accent color</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose your preferred highlight color.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {accentColors.map((color) => {
                const selected = appearance.accentColor === color.value;

                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateSetting("accentColor", color.value)}
                    aria-label={color.name}
                    aria-pressed={selected}
                    title={color.name}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                      selected
                        ? "scale-110 border-slate-900 ring-2 ring-slate-300 ring-offset-2"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selected && <Check size={21} className="text-white" />}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Selected:{" "}
              <span className="font-semibold text-slate-800">
                {accentColors.find(
                  (color) => color.value === appearance.accentColor
                )?.name || "Custom"}
              </span>
            </p>
          </section>

          {/* Layout */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-sky-50 p-3 text-sky-800">
                <LayoutDashboard size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Layout preferences</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Adjust the spacing of your dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={appearance.compactLayout}
              onClick={() =>
                updateSetting("compactLayout", !appearance.compactLayout)
              }
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold">Compact layout</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Use a compact spacing preference for supported components.
                </p>
              </div>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  appearance.compactLayout ? "bg-blue-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    appearance.compactLayout ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </section>

          {/* Preview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Eye size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Live preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preview your selected accent color.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    TOTAL BALANCE
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ₹24,850
                  </p>
                </div>
                <span
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: appearance.accentColor }}
                >
                  Dashboard
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Income</p>
                  <p className="mt-1 font-bold text-emerald-700">₹35,000</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Expenses</p>
                  <p className="mt-1 font-bold text-red-600">₹10,150</p>
                </div>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                aria-label="Example budget progress"
              >
                <div
                  className="h-full w-2/3 rounded-full"
                  style={{ backgroundColor: appearance.accentColor }}
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={resetAppearance}
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset changes
            </button>

            <button
              type="submit"
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: appearance.accentColor }}
            >
              <Save size={17} />
              Save appearance
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

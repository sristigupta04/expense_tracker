
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Palette,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  CircleHelp,
  UserRoundCog,
  ChevronRight,
  Search,
  Settings2,
  Sparkles,
  Monitor,
  LockKeyhole,
  CircleUserRound,
} from "lucide-react";

const settingsGroups = [
  {
    title: "PERSONALIZATION",
    items: [
      {
        title: "Profile",
        description: "Manage your personal information and account details.",
        icon: UserRound,
        path: "/settings/profile",
      },
      {
        title: "Appearance",
        description: "Customize your theme and dashboard appearance.",
        icon: Palette,
        path: "/settings/appearance",
      },
      {
        title: "Preferences",
        description: "Set your currency, date format and other preferences.",
        icon: SlidersHorizontal,
        path: "/settings/preferences",
      },
    ],
  },
  {
    title: "ACCOUNT & SECURITY",
    items: [
      {
        title: "Notifications",
        description: "Manage budget alerts, reminders and notifications.",
        icon: Bell,
        path: "/settings/notifications",
      },
      {
        title: "Privacy & Security",
        description: "Manage password, privacy and security options.",
        icon: ShieldCheck,
        path: "/settings/privacy",
      },
      {
        title: "Account Management",
        description: "Manage account status and account deletion.",
        icon: UserRoundCog,
        path: "/settings/account",
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Help & Support",
        description: "Find answers or get help with your account.",
        icon: CircleHelp,
        path: "/settings/help",
      },
    ],
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return settingsGroups;

    return settingsGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Settings2 size={16} />
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span className="text-blue-700">Settings</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Customize your account and manage your preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-blue-100 bg-white px-3 py-2.5 shadow-sm">
            <Sparkles size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              Personalize your workspace
            </span>
          </div>
        </div>

        {/* Profile overview */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-[#03045E] via-[#0D21A1] to-[#2563EB]" />

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <CircleUserRound size={30} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">Your account</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep your personal and financial preferences up to date.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/settings/profile")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Edit profile
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <label
            htmlFor="settings-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Find a setting
          </label>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="settings-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search profile, appearance, notifications..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Settings groups */}
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-3 px-1 text-xs font-bold tracking-[0.14em] text-slate-500">
                {group.title}
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {group.items.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`group flex w-full items-center gap-4 px-4 py-5 text-left transition hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50 sm:px-5 ${
                        index !== group.items.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0D21A1] transition group-hover:bg-[#0D21A1] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-800 transition group-hover:text-[#0D21A1]">
                          {item.title}
                        </h4>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={19}
                        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {filteredGroups.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <Search
                size={28}
                className="mx-auto mb-3 text-slate-400"
              />
              <h3 className="font-semibold text-slate-800">
                No settings found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try searching with a different keyword.
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 pb-4 text-xs text-slate-400">
          <Monitor size={14} />
          <span>Personal Finance Tracker</span>
          <span>•</span>
          <LockKeyhole size={13} />
          <span>Account settings</span>
        </div>
      </div>
    </div>
  );
}
